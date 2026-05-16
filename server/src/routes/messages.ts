import express from 'express';
import { DB } from '../utils/db';
import { auth, adminOnly } from '../middleware/auth';

const router = express.Router();

// Get conversations (groups + direct messages)
router.get('/conversations', auth, async (req: any, res) => {
  try {
    const groups = await DB.find('groups');
    // For direct messages, we'll just show all users for now
    // In a real app, you'd filter by who you've actually messaged
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get unread messages count
router.get('/unread/count', auth, async (req: any, res) => {
  try {
    const messages = await DB.find('messages', (m) => m.senderId !== req.userId && !m.isRead);
    res.json({ count: messages.length });
  } catch (error) {
    res.json({ count: 0 });
  }
});

// Mark messages as read for a conversation
router.post('/read/:conversationId', auth, async (req: any, res) => {
  try {
    const messages = await DB.find('messages', (m) => m.conversationId === req.params.conversationId && m.senderId !== req.userId && !m.isRead);
    
    for (const msg of messages) {
      await DB.update('messages', msg.id, { isRead: true });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Create a group (Admin only)
router.post('/groups', auth, adminOnly, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const group = await DB.insert('groups', {
      name,
      memberIds,
      type: 'group',
      createdAt: new Date().toISOString()
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group' });
  }
});

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const messages = await DB.find('messages', (m) => m.conversationId === req.params.conversationId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/', auth, async (req: any, res) => {
  try {
    const { conversationId, text } = req.body;
    const message = await DB.insert('messages', {
      conversationId,
      text,
      senderId: req.userId,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    
    // Emit to socket (handled in index.ts)
    const io = req.app.get('io');
    io.to(`conversation-${conversationId}`).emit('new-message', message);
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;
