import express from "express";
import appRoutes from "./routes/index.js";
import "reflect-metadata";
import logger from "./services/logger/index.js";

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

app.listen(PORT, () => {
    logger.info("Server is listening on the port", PORT);

    const wss = new WebSocketServer({ port: 4000 });

    console.log("WS on 4000");

    wss.on("connection", (socket) => {
        console.log("New client connected");
    });
    console.log("Server is listening on the port", PORT);
});

