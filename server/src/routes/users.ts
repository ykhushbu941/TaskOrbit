import express from 'express';
import prisma from '../utils/prisma';
import { auth, adminOnly } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all users (members list)
router.get('/', auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        assignedProjectId: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create new user (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { email, password, name, role, assignedProjectId, avatar } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 12);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: (role || 'MEMBER').toUpperCase(), // Standardize to uppercase
        assignedProjectId: assignedProjectId && assignedProjectId !== "" ? assignedProjectId : null,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        status: 'active'
      }
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      details: error.message,
      code: error.code 
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Patch user
router.patch('/:id', auth, async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

export default router;
