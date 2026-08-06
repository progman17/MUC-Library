import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { sendVerificationEmail } from '../utils/mailer';
import { authenticateToken } from '../middlewares/authMiddleware';
import crypto from 'crypto';

const router = Router();

router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const isAllowedEmail = email.endsWith('@muc.edu.eg');

        if (!isAllowedEmail) {
            return res.status(400).json({ error: 'Only @muc.edu.eg emails are allowed' });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    role: 'student',
                    displayName: email.split('@')[0],
                }
            });
        }

        const code = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.verification.create({
            data: {
                email,
                code,
                token: crypto.randomBytes(32).toString('hex'),
                expiresAt,
            }
        });

        try {
            await sendVerificationEmail(email, code);
        } catch (mailError) {
            console.error("Failed to send verification email:", mailError);
            return res.status(500).json({ error: 'Failed to send verification email' });
        }

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const verification = await prisma.verification.findFirst({
            where: { email, code, used: false },
            orderBy: { createdAt: 'desc' }
        });

        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        await prisma.verification.update({
            where: { id: verification.id },
            data: { used: true }
        });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName, profilePath: user.profilePath, phone: user.phone } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({ user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName, profilePath: user.profilePath, phone: user.phone } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
