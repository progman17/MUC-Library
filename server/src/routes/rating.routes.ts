import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const { userId } = req.query; // Send from frontend
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const rating = await prisma.rating.findUnique({
            where: {
                userId_bookId: {
                    userId: String(userId),
                    bookId: String(bookId)
                }
            }
        });
        
        res.json({ data: rating });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { bookId, userId, rating } = req.body;
        
        const upsertedRating = await prisma.rating.upsert({
            where: {
                userId_bookId: {
                    userId,
                    bookId
                }
            },
            update: { rating },
            create: { userId, bookId, rating }
        });

        // Recalculate book rating
        const allRatings = await prisma.rating.findMany({ where: { bookId } });
        const average = allRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / allRatings.length;

        const updatedBook = await prisma.book.update({
            where: { id: bookId },
            data: { rating: parseFloat(average.toFixed(1)) }
        });

        res.json({ data: upsertedRating, book: updatedBook });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
