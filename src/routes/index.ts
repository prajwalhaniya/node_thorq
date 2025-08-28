import express from "express";
import { broker } from "../services/broker/borker.js"

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
    res.send("This is a simple route");
});

router.get("/health", async (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(healthCheck);
});

router.get('/stats', async (_req, res) => {
    res.json(broker.stats())
});

export default router;