// src/broker/Topic.ts
import logger from '../logger/index.js';
import { Subscriber } from './brokerTypes.js';

export class Topic {
    public readonly name: string;
    private subscribers: Map<string, Subscriber> = new Map();
    public published = 0;
    public delivered = 0;

    constructor(name: string) {
        this.name = name;
    }

    add(sub: Subscriber) {
        this.subscribers.set(sub.id, sub);
    }

    remove(subId: string) {
        this.subscribers.delete(subId);
    }

    subscriberCount() {
        return this.subscribers.size;
    }

    broadcast(frame: Omit<Subscriber['queue'][number], 'op'> & { op?: 'message' }) {
        this.published++;
        
        const f = { op: 'message' as const, ...frame, topic: this.name };
        
        for (const sub of this.subscribers.values()) {
            if (sub.queue.length >= sub.maxQueue) sub.queue.shift();
            sub.queue.push(f);
            
            this.delivered++;
            
            if (!sub.sending) this.drain(sub);
        }
    }

    private drain(sub: Subscriber) {
        if (sub.sending) return;
        
        sub.sending = true;

        const sendNext = () => {
            const next = sub.queue.shift();
            
            if (!next) {
                sub.sending = false;
                return;
            }
            
            if (sub.socket.readyState !== sub.socket.OPEN) {
                sub.queue.length = 0;
                sub.sending = false;
                return;
            }

            sub.socket.send(JSON.stringify(next), err => {
                if (err) {
                // if send fails, drop remaining to avoid memory leak and close
                sub.queue.length = 0;
                try { 
                    sub.socket.close(1011, 'send-failed'); 
                } catch {
                    logger.error(`Error closing socket: ${err}`);
                }

                    sub.sending = false;
                    return;
                }
                // schedule next tick to keep event loop responsive
                setImmediate(sendNext);
            });
        };

    sendNext();
  }

  ejectAll(reason = 'topic-deleted') {
    for (const sub of this.subscribers.values()) {
        try { 
            sub.socket.send(JSON.stringify({ op: 'info', topic: this.name, reason })); 
        } catch (err) {
            logger.error(`Error sending info: ${err}`);
        }
        sub.topics.delete(this.name);
    }

    this.subscribers.clear();
  }
}
