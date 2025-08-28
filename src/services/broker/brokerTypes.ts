import { WebSocket as WS } from "ws";

export interface OutboundFrame {
    op: 'message' | 'info' | 'error' | 'pong';
    topic?: string;
    data?: unknown;
    msgId?: string;
    reason?: string;
  }

  
export interface Subscriber {
    id: string;
    socket: WS;
    queue: OutboundFrame[];
    sending: boolean;
    maxQueue: number;
    topics: Set<string>;
  }