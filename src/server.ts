import express from "express";
import appRoutes from "./routes/index.js";
import "reflect-metadata";
import logger from "./services/logger/index.js";
import http from "http";

import { Request, Response, NextFunction } from "express";
import { attachWs } from "./services/webSocket/index.js";
import { WebSocketServer } from "ws";

const PORT = 3000;
const app = express();
app.use(express.json());

const router = express.Router({ mergeParams: true });

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // handle the error as required
    res.status(500).send(err.message);
});

router.use("/app", appRoutes);

const server = http.createServer(app);
attachWs(server);

server.listen(PORT, () => {
    logger.info("Server is listening on port", PORT);
    console.log(`HTTP + WS server running at http://localhost:${PORT}`);
    console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});