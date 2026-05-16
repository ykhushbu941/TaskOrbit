import express from 'express';
import prisma from '../utils/prisma';
import { auth, adminOnly } from '../middleware/auth';

const router = express.Router();

// Get tasks
router.get('/', auth, async (req: any, res) => {
  try {
    const role = String(req.userRole).toUpperCase();
    const { assigneeId, projectId } = req.query;

    if (role === 'ADMIN') {
      const tasks = await prisma.task.findMany({
        where: {
          ...(assigneeId ? { assignees: { some: { userId: assigneeId as string } } } : {}),
          ...(projectId ? { projectId: projectId as string } : {})
        },
        include: { assignees: { include: { user: true } }, project: true }
      });
      res.json(tasks);
    } else {
      // Members see tasks they are assigned to OR tasks in their assigned project
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      
      const tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assignees: { some: { userId: req.userId } } },
            { projectId: user?.assignedProjectId || 'none' }
          ]
        },
        include: { assignees: { include: { user: true } }, project: true }
      });
      res.json(tasks);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create task (Admin only)
router.post('/', auth, adminOnly, async (req: any, res) => {
  try {
    const { name, description, urgency, status, projectId, dueDate, assigneeIds } = req.body;

    // Validation
    if (!name || !projectId) {
      return res.status(400).json({ message: 'Name and Project are required' });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description: description || "",
        urgency: urgency || 'Medium',
        status: status || 'To Do',
        projectId,
        dueDate: dueDate && dueDate !== "" ? new Date(dueDate) : null,
        assignees: {
          create: (Array.isArray(assigneeIds) ? assigneeIds : [])
            .filter(id => id && id !== "")
            .map((userId: string) => ({ userId }))
        }
      },
      include: { assignees: true }
    });
    
    // Notifications
    if (assigneeIds?.length > 0) {
      await prisma.notification.createMany({
        data: assigneeIds.map((userId: string) => ({
          userId,
          title: 'New Task Assigned',
          message: `You have been assigned to: ${name}`,
          taskId: task.id
        }))
      });
    }

    // Activity Log
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        userName: user?.name || 'Admin',
        action: 'created task',
        targetName: name,
        projectId: projectId
      }
    });

    // Recalculate Project Progress
    const allProjectTasks = await prisma.task.findMany({ where: { projectId } });
    const doneTasks = allProjectTasks.filter(t => t.status === 'Done').length;
    const progress = allProjectTasks.length > 0 ? Math.round((doneTasks / allProjectTasks.length) * 100) : 0;
    
    await prisma.project.update({
      where: { id: projectId },
      data: { progress }
    });

    // Real-time Sync
    const io = req.app.get('io');
    io.emit('task-created', task);
    io.emit('project-updated', { id: projectId, progress }); // Sync progress change
    assigneeIds?.forEach((uid: string) => io.to(uid).emit('notification', { title: 'New Task' }));

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update task (Admin or assigned Member)
router.put('/:id', auth, async (req: any, res) => {
  try {
    const role = String(req.userRole).toUpperCase();
    const taskId = req.params.id;
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignees: true }
    });

    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const isAssigned = existingTask.assignees.some(a => a.userId === req.userId);
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const isInProject = existingTask.projectId === user?.assignedProjectId;

    if (role !== 'ADMIN' && !isAssigned && !isInProject) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Members can only update status
    const updateData = role === 'ADMIN' ? {
      ...req.body,
      dueDate: req.body.dueDate && req.body.dueDate !== "" ? new Date(req.body.dueDate) : undefined,
    } : { status: req.body.status };

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: { assignees: { include: { user: true } }, project: true }
    });

    // Log Activity
    // (user is already fetched above)
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        userName: user?.name || 'User',
        action: `updated status to ${req.body.status}`,
        targetName: updatedTask.name,
        projectId: updatedTask.projectId
      }
    });

    // Recalculate Project Progress
    const allProjectTasks = await prisma.task.findMany({ where: { projectId: updatedTask.projectId } });
    const doneTasks = allProjectTasks.filter(t => t.status === 'Done').length;
    const progress = allProjectTasks.length > 0 ? Math.round((doneTasks / allProjectTasks.length) * 100) : 0;
    
    await prisma.project.update({
      where: { id: updatedTask.projectId },
      data: { progress }
    });

    // Real-time Sync
    const io = req.app.get('io');
    io.emit('task-updated', updatedTask);
    io.emit('project-updated', { id: updatedTask.projectId, progress });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete task (Admin only)
router.delete('/:id', auth, adminOnly, async (req: any, res) => {
  try {
    const deletedTask = await prisma.task.delete({ where: { id: req.params.id } });
    
    // Recalculate Project Progress
    const allProjectTasks = await prisma.task.findMany({ where: { projectId: deletedTask.projectId } });
    const doneTasks = allProjectTasks.filter(t => t.status === 'Done').length;
    const progress = allProjectTasks.length > 0 ? Math.round((doneTasks / allProjectTasks.length) * 100) : 0;
    
    await prisma.project.update({
      where: { id: deletedTask.projectId },
      data: { progress }
    });

    const io = req.app.get('io');
    io.emit('task-deleted', req.params.id);
    io.emit('project-updated', { id: deletedTask.projectId, progress });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

export default router;
