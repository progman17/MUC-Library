import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticateToken } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

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
