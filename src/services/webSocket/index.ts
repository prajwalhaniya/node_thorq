// src/ws/handler.ts
import { WebSocketServer } from 'ws';
import { broker } from '../broker/borker.js';
import { Operation } from '../broker/brokerTypes.js';
import type { Server } from 'http';

export function attachWs(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    const client = broker.attachClient(socket);

    const send = (obj: unknown) => {
      if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(obj));
    };

    send({ op: 'info', data: { clientId: client.id, message: 'connected' } });

    socket.on('message', (buf) => {
        let msg: Operation;
        
        try { 
            msg = JSON.parse(buf.toString()); 
        } catch {
            send({ op: 'error', reason: 'invalid-json' });
            return;
        }
        
        switch (msg.op) {
            case 'subscribe':
                broker.subscribe(client, msg.topic);
                send({ op: 'info', topic: msg.topic, reason: 'subscribed' });
                break;
            case 'unsubscribe':
                broker.unsubscribe(client, msg.topic);
                send({ op: 'info', topic: msg.topic, reason: 'unsubscribed' });
                break;
            case 'publish':
                if (!broker.publish(msg.topic, msg.data))
                    send({ op: 'error', topic: msg.topic, reason: 'topic-not-found' });
                break;
            case 'ping':
                send({ op: 'pong' });
                break;
            default:
                send({ op: 'error', reason: 'unknown-op' });
        }
    });

    socket.on('close', () => broker.detachClient(client.id));
    socket.on('error', () => broker.detachClient(client.id));
  });

  return wss;
}
