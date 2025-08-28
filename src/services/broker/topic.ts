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
      // ✅ Backpressure handling
      if (sub.queue.length >= sub.maxQueue) {
        if (sub.policy === 'drop_oldest') {
          sub.queue.shift(); // drop oldest and enqueue new one
        } else {
          // default = disconnect policy
          try {
            sub.socket.send(JSON.stringify({
              op: 'error',
              reason: 'backpressure',
              topic: this.name,
              message: `Client ${sub.id} disconnected due to queue overflow`
            }));
          } catch (err) {
            logger.error(`Error sending backpressure error: ${err}`);
          }
          try {
            sub.socket.close(1011, 'backpressure');
          } catch {}
          sub.queue.length = 0;
          continue; // skip enqueuing
        }
      }

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
          // drop remaining to avoid memory leak
          sub.queue.length = 0;
          try {
            sub.socket.close(1011, 'send-failed');
          } catch (e) {
            logger.error(`Error closing socket: ${e}`);
          }
          sub.sending = false;
          return;
        }
        // keep event loop responsive
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
