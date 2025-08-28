import type { Server } from 'http';
export declare function attachWs(server: Server): import("ws").Server<typeof import("ws").default, typeof import("http").IncomingMessage>;
