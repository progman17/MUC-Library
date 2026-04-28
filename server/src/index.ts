import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bookRoutes from './routes/book.routes';
import collegeRoutes from './routes/college.routes';
import ratingRoutes from './routes/rating.routes';
import analyticsRoutes from './routes/analytics.routes';
import prisma from './config/prisma';

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files — use __dirname so path is always correct regardless of where the process is launched
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler for DB Connection and Unhandled Errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
        return res.status(500).json({ error: 'Database connection or query error', details: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 5000;

// Test Prisma Connection and Start Server
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to the database.');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error: any) {
        console.error('❌ Failed to connect to the database:', error.message);
        // We still start the server but we let it run so it returns clear JSON errors 
        // to the client via a middleware instead of completely crashing the container.
        app.listen(PORT, () => {
            console.log(`⚠️ Server running with DB connection issues on port ${PORT}`);
        });
    }
};

startServer();
