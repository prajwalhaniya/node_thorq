import { WebSocket } from "ws";

export interface OutboundFrame {
    op: 'message' | 'info' | 'error' | 'pong';
    topic?: string;
    data?: unknown;
    msgId?: string;
    reason?: string;
}

export type Operation =
  | { op: 'subscribe'; topic: string }
  | { op: 'unsubscribe'; topic: string }
  | { op: 'publish'; topic: string; data: unknown }
  | { op: 'ping' };

export type BackpressurePolicy = 'drop_oldest' | 'disconnect';
  
export interface Subscriber {
    id: string;
    socket: WS;
    queue: OutboundFrame[];
    sending: boolean;
    maxQueue: number;
    topics: Set<string>;
    policy?: BackpressurePolicy;
}

export interface Stats {
    startedAt: number;
    clients: number;
    topics: number;
    published: number;
    delivered: number;
    perTopic: Record<string, { subs: number; published: number; delivered: number }>;
}


export type WS = WebSocket;