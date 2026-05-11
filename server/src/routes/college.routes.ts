import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const colleges = await prisma.college.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ data: colleges });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/departments', async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ data: departments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const college = await prisma.college.create({ data: { name } });
        res.json({ data: college });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/departments', async (req, res) => {
    try {
        const { name, collegeId } = req.body;
        const department = await prisma.department.create({
            data: { name, collegeId }
        });
        res.json({ data: department });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.college.delete({ where: { id: req.params.id } });
        res.json({ message: 'College deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/departments/:id', async (req, res) => {
    try {
        await prisma.department.delete({ where: { id: req.params.id } });
        res.json({ message: 'Department deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/departments/name/:name', async (req, res) => {
    try {
        await prisma.department.deleteMany({
            where: { name: { equals: req.params.name, mode: 'insensitive' } }
        });
        res.json({ message: 'Departments deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/visit', async (req, res) => {
    try {
        const { userId, visitorToken, departmentId } = req.body;
        const collegeId = req.params.id;

        if (!userId && !visitorToken) {
            return res.status(400).json({ error: 'userId or visitorToken is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let uniqueCollegeVisit = false;
        let uniqueDepartmentVisit = false;

        // 1. College Visit Logic
        const existingCollegeVisit = await prisma.collegeVisit.findFirst({
            where: {
                collegeId,
                OR: [
                    { userId: userId || undefined },
                    { visitorToken: visitorToken || undefined }
                ],
                visitedAt: { gte: today }
            }
        });

        if (!existingCollegeVisit) {
            await prisma.collegeVisit.create({
                data: {
                    collegeId,
                    userId: userId || null,
                    visitorToken: visitorToken || null,
                }
            });

            await prisma.college.update({
                where: { id: collegeId },
                data: { visitCount: { increment: 1 } }
            });
            uniqueCollegeVisit = true;
        }

        // 2. Department Visit Logic (if departmentId provided)
        if (departmentId && String(departmentId) !== 'undefined') {
            const existingDeptVisit = await (prisma as any).departmentVisit.findFirst({
                where: {
                    departmentId: String(departmentId),
                    OR: [
                        { userId: userId || undefined },
                        { visitorToken: visitorToken || undefined }
                    ],
                    visitedAt: { gte: today }
                }
            });

            if (!existingDeptVisit) {
                // Record the unique visit
                await (prisma as any).departmentVisit.create({
                    data: {
                        departmentId: String(departmentId),
                        userId: userId || null,
                        visitorToken: visitorToken || null,
                    }
                });

                // Increment the historical counter
                await (prisma as any).department.update({
                    where: { id: String(departmentId) },
                    data: { visitCount: { increment: 1 } } as any
                });
                uniqueDepartmentVisit = true;
            }
        }

        const college = await prisma.college.findUnique({ where: { id: collegeId } });
        res.json({ 
            data: { 
                visitCount: college?.visitCount, 
                uniqueCollegeVisit,
                uniqueDepartmentVisit
            } 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/departments/:id/visit', async (req, res) => {
    try {
        const { userId, visitorToken } = req.body;
        const departmentId = req.params.id;

        if (!userId && !visitorToken) {
            return res.status(400).json({ error: 'userId or visitorToken is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Record Department Visit
        const existingDeptVisit = await (prisma as any).departmentVisit.findFirst({
            where: {
                departmentId,
                OR: [
                    { userId: userId || undefined },
                    { visitorToken: visitorToken || undefined }
                ],
                visitedAt: { gte: today }
            }
        });

        if (!existingDeptVisit) {
            await (prisma as any).departmentVisit.create({
                data: {
                    departmentId,
                    userId: userId || null,
                    visitorToken: visitorToken || null,
                }
            });

            await prisma.department.update({
                where: { id: departmentId },
                data: { visitCount: { increment: 1 } } as any
            });
        }

        // 2. Relational Increment: Trigger College Visit
        const dept = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { collegeId: true }
        });

        if (dept?.collegeId) {
            const collegeId = dept.collegeId;
            const existingCollegeVisit = await prisma.collegeVisit.findFirst({
                where: {
                    collegeId,
                    OR: [
                        { userId: userId || undefined },
                        { visitorToken: visitorToken || undefined }
                    ],
                    visitedAt: { gte: today }
                }
            });

            if (!existingCollegeVisit) {
                await prisma.collegeVisit.create({
                    data: {
                        collegeId,
                        userId: userId || null,
                        visitorToken: visitorToken || null,
                    }
                });

                await prisma.college.update({
                    where: { id: collegeId },
                    data: { visitCount: { increment: 1 } }
                });
            }
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
