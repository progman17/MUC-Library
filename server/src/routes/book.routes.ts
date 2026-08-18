import { Router } from 'express';
import prisma from '../config/prisma';
import { upload } from '../config/multer';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { collegeId, format, category, type, topRated } = req.query;
        let where: any = {};
        
        if (collegeId && collegeId !== 'all') where.collegeId = String(collegeId);
        if (format) where.format = String(format);
        if (category && category !== 'all') where.category = { contains: String(category), mode: 'insensitive' };
        if (type && type !== 'all') where.type = String(type);

        let orderBy: any = { createdAt: 'desc' };
        let take = undefined;

        if (topRated === 'true') {
            where.rating = { gt: 0 };
            orderBy = { rating: 'desc' };
            take = 4;
        }

        const books = await prisma.book.findMany({
            where,
            orderBy,
            take,
            include: { college: true }
        });
        
        res.json({ data: books.map((book: any) => ({...book, colleges: book.college})) });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id },
            include: { college: true }
        });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ data: { ...book, colleges: book.college } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/read', async (req, res) => {
    try {
        const { userId, visitorToken } = req.body;
        const book = await prisma.book.update({
            where: { id: req.params.id },
            data: { readCount: { increment: 1 } },
            include: { college: true }
        });

        if (book.collegeId && (userId || visitorToken)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const orConditions: any[] = [];
            if (userId) orConditions.push({ userId });
            if (visitorToken) orConditions.push({ visitorToken });

            const existingVisit = await prisma.collegeVisit.findFirst({
                where: {
                    collegeId: book.collegeId,
                    OR: orConditions,
                    visitedAt: { gte: today }
                }
            });

            if (!existingVisit) {
                await prisma.collegeVisit.create({
                    data: {
                        collegeId: book.collegeId,
                        userId: userId || null,
                        visitorToken: visitorToken || null,
                    }
                });

                await prisma.college.update({
                    where: { id: book.collegeId },
                    data: { visitCount: { increment: 1 } }
                });
            }
        }

        res.json({ data: { readCount: book.readCount } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, category, collegeId, format, type, shelfLocation, externalLink, coverPath, pdfPath } = req.body;
        const book = await prisma.book.create({
            data: {
                title,
                description,
                category,
                collegeId,
                format,
                type,
                shelfLocation,
                externalLink,
                coverPath,
                pdfPath,
                createdById: req.user?.userId
            }
        });
        res.json({ data: book });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, category, collegeId, format, type, shelfLocation, externalLink, coverPath, pdfPath } = req.body;
        const book = await prisma.book.update({
            where: { id: req.params.id as string },
            data: { 
                title, 
                description, 
                category, 
                collegeId, 
                format, 
                type, 
                shelfLocation, 
                externalLink,
                coverPath,
                pdfPath
            }
        });
        res.json({ data: book });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await prisma.book.delete({ where: { id: req.params.id as string } });
        res.json({ data: null });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Upload route for book cover and pdf
router.post('/:id/upload', authenticateToken, isAdmin, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const updates: any = {};
        
        if (files['cover']?.[0]) {
            updates.coverPath = files['cover'][0].filename;
        }
        if (files['pdf']?.[0]) {
            updates.pdfPath = files['pdf'][0].filename;
        }

        if (Object.keys(updates).length > 0) {
            const book = await prisma.book.update({
                where: { id: req.params.id as string },
                data: updates
            });
            res.json({ data: book });
        } else {
            res.status(400).json({ error: 'No files uploaded' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
