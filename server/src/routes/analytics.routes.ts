import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/track', async (req, res) => {
    try {
        const { userId, visitorToken } = req.body;
        
        if (userId) {
            await prisma.libraryVisitor.upsert({
                where: { userId },
                update: { lastVisitedAt: new Date() },
                create: { userId, visitorToken, lastVisitedAt: new Date() }
            });
        } else if (visitorToken) {
            await prisma.libraryVisitor.upsert({
                where: { visitorToken },
                update: { lastVisitedAt: new Date() },
                create: { visitorToken, lastVisitedAt: new Date() }
            });
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const count = await prisma.user.count();
        res.json({ data: count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/books', async (req, res) => {
    try {
        const colleges = await prisma.college.findMany();
        const counts: Record<string, number> = {};
        
        for (const college of colleges) {
            counts[college.name] = await prisma.book.count({
                where: { collegeId: college.id }
            });
        }
        res.json({ data: counts });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { collegeId } = req.query;
        
        let where: any = { category: { contains: String(category), mode: 'insensitive' } };
        if (collegeId && collegeId !== 'all') {
            where.collegeId = String(collegeId);
        }
        
        const count = await prisma.book.count({ where });
        res.json({ data: count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
