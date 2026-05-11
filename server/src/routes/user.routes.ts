import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

// Get all users (Admin only)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                profilePath: true,
                createdAt: true
            }
        });
        res.json({ data: users });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update user role (Admin only)
router.patch('/update-role', authenticateToken, isAdmin, async (req, res) => {
    console.log('PATCH /api/users/update-role hit with body:', req.body);
    try {
        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }

        if (!['admin', 'student'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Prevent self-demotion
        if (userId === req.user?.userId && role !== 'admin') {
            return res.status(400).json({ error: 'You cannot demote yourself' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.json({ data: user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { displayName, phone } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user?.userId },
            data: { displayName, phone }
        });
        res.json({ data: user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/upload-profile', authenticateToken, upload.single('profile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const user = await prisma.user.update({
            where: { id: req.user?.userId },
            data: { profilePath: req.file.filename }
        });
        
        res.json({ data: user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
