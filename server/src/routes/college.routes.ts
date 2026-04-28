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

export default router;
