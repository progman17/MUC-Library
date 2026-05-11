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
        res.json({ data: count + 190 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/books', async (req, res) => {
    try {
        const colleges = await prisma.college.findMany();
        const counts: Record<string, number> = {};
        const visitCounts: Record<string, number> = {};
        const growth: Record<string, number> = {};
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const p = prisma as any;

        for (const college of colleges) {
            counts[college.name] = await prisma.book.count({
                where: { collegeId: college.id }
            });
            
            visitCounts[college.name] = (college as any).visitCount || 0;

            // Calculate growth based on CollegeVisit logs
            const visitsToday = await p.collegeVisit.count({
                where: {
                    collegeId: college.id,
                    visitedAt: { gte: today }
                }
            });

            const visitsYesterday = await p.collegeVisit.count({
                where: {
                    collegeId: college.id,
                    visitedAt: {
                        gte: yesterday,
                        lt: today
                    }
                }
            });

            if (visitsYesterday === 0) {
                growth[college.name] = visitsToday > 0 ? 100 : 0;
            } else {
                growth[college.name] = Math.round(((visitsToday - visitsYesterday) / visitsYesterday) * 100);
            }
        }

        res.json({ 
            data: counts,
            visits: visitCounts,
            growth: growth
        });
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

router.get('/top-departments', authenticateToken, isAdmin, async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { visitCount: 'desc' } as any,
            take: 5,
            include: { college: { select: { name: true } } }
        });
        res.json({ data: departments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/college/:id/department-stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const collegeId = req.params.id;
        const departments = await prisma.department.findMany({
            where: { collegeId: String(collegeId) },
            orderBy: { visitCount: 'desc' } as any
        });

        const stats = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (const dept of departments) {
            const visitsToday = await (prisma as any).departmentVisit.count({
                where: { departmentId: dept.id, visitedAt: { gte: today } }
            });
            const visitsYesterday = await (prisma as any).departmentVisit.count({
                where: { departmentId: dept.id, visitedAt: { gte: yesterday, lt: today } }
            });

            let growth = 0;
            if (visitsYesterday === 0) {
                growth = visitsToday > 0 ? 100 : 0;
            } else {
                growth = Math.round(((visitsToday - visitsYesterday) / visitsYesterday) * 100);
            }

            stats.push({
                id: dept.id,
                name: dept.name,
                visitCount: (dept as any).visitCount,
                visitsToday,
                growth
            });
        }

        res.json({ data: stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
