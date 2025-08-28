import express from "express";
import userController from "../controller/index.js";

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


export default router;