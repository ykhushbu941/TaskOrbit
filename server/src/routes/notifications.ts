import express from 'express';
import { DB } from '../utils/db';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get notifications for current user
router.get('/', auth, async (req: any, res) => {
  try {
    const notifications = await DB.find('notifications', (n) => n.userId === req.userId);
    // Sort by createdAt descending
    const sorted = notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all as read
router.post('/read-all', auth, async (req: any, res) => {
  try {
    const notifications = await DB.find('notifications', (n) => n.userId === req.userId && !n.read);
    for (const notif of notifications) {
      await DB.update('notifications', notif.id, { read: true });
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

// Mark one as read
router.post('/:id/read', auth, async (req: any, res) => {
  try {
    const updated = await DB.update('notifications', req.params.id, { read: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

export default router;
