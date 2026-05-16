import express from 'express';
import prisma from '../utils/prisma';
import { auth, adminOnly } from '../middleware/auth';

const router = express.Router();

// Get all projects
router.get('/', auth, async (req: any, res) => {
  try {
    const role = String(req.userRole).toUpperCase();
    if (role === 'ADMIN') {
      const projects = await prisma.project.findMany({
        include: { tasks: true, members: true }
      });
      res.json(projects);
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { assignedProject: { include: { tasks: true, members: true } } }
      });
      res.json(user?.assignedProject ? [user.assignedProject] : []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get single project
router.get('/:id', auth, async (req: any, res) => {
  try {
    const role = String(req.userRole).toUpperCase();
    const projectId = req.params.id;

    if (role === 'ADMIN') {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: { include: { assignees: { include: { user: true } } } }, members: true }
      });
      return res.json(project);
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });
      
      if (user?.assignedProjectId !== projectId) {
        return res.status(403).json({ message: 'Access denied to this project' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: { include: { assignees: { include: { user: true } } } }, members: true }
      });
      res.json(project);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project details' });
  }
});

// Create project (Admin only)
router.post('/', auth, adminOnly, async (req: any, res) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      }
    });
    
    // Log activity
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        userName: user?.name || 'Admin',
        action: 'launched project',
        targetName: project.name,
        projectId: project.id
      }
    });

    // Real-time Sync
    const io = req.app.get('io');
    io.emit('project-created', project);

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Update project (Admin only)
router.put('/:id', auth, adminOnly, async (req: any, res) => {
  try {
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      }
    });

    // Real-time Sync
    const io = req.app.get('io');
    io.emit('project-updated', updated);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Delete project (Admin only)
router.delete('/:id', auth, adminOnly, async (req: any, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    
    // Real-time Sync
    const io = req.app.get('io');
    io.emit('project-deleted', req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
