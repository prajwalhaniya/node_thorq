import express from "express";
import { broker } from "../services/broker/borker.js"

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
    res.send("This is a simple route");
});

router.get("/health", (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(healthCheck);
});

router.get('/stats', (_req, res) => {
    res.json(broker.stats())
});

router.get('/topics', (req, res) => {
    res.json({ topics: broker.listTopics() })
});


router.post('/topics', (req, res) => {
    const { name } = req.body ?? {};
    console.log({ re: req.body });
    
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name-required' });
    
    const ok = broker.createTopic(name);
    
    return ok ? res.status(201).json({ ok: true }) : res.status(409).json({ error: 'exists' });
})

export default router;