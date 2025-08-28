import { randomUUID } from 'crypto';
import { Topic } from './topic.js';
import { Subscriber, Stats, WS, BackpressurePolicy } from './brokerTypes.js';

export class Broker {
    private topics = new Map<string, Topic>();
    private clients = new Map<string, Subscriber>();
    private _published = 0;
    private _delivered = 0;
    private readonly startedAt = Date.now();

    createTopic(name: string) {
        if (!name || this.topics.has(name)) return false;
        this.topics.set(name, new Topic(name));
        return true;
    }
    
    deleteTopic(name: string) {
        const t = this.topics.get(name);
        if (!t) return false;
        t.ejectAll();
        this.topics.delete(name);
        return true;
    }
    
    listTopics() {
        return [...this.topics.keys()];
    }

    attachClient(socket: WS, maxQueue = 100, policy: BackpressurePolicy = 'disconnect'): Subscriber {
        const sub: Subscriber = {
            id: randomUUID(),
            socket,
            queue: [],
            sending: false,
            maxQueue,
            topics: new Set(),
            policy
        };
        
        this.clients.set(sub.id, sub);
        
        return sub;
    }

    detachClient(subId: string) {
        const sub = this.clients.get(subId);
        
        if (!sub) return;
        
        for (const topic of sub.topics) {
            this.topics.get(topic)?.remove(subId);
        }
        
        this.clients.delete(subId);
    }

    subscribe(sub: Subscriber, topicName: string) {
        const topic = this.topics.get(topicName) ?? (this.createTopic(topicName), this.topics.get(topicName)!);
        topic.add(sub);
        sub.topics.add(topicName);
    }

    unsubscribe(sub: Subscriber, topicName: string) {
        this.topics.get(topicName)?.remove(sub.id);
        sub.topics.delete(topicName);
    }

    publish(topicName: string, data: unknown) {
        const t = this.topics.get(topicName);
        if (!t) return false;
        
        this._published++;
        
        t.broadcast({ data, msgId: randomUUID() });
        
        this._delivered++;
        
        return true;
    }

    stats(): Stats {
        const perTopic: Stats['perTopic'] = {};
        
        for (const [name, t] of this.topics.entries()) {
            perTopic[name] = { subs: t['subscriberCount'](), published: t.published, delivered: t.delivered };
        }
        
        return {
            startedAt: this.startedAt,
            clients: this.clients.size,
            topics: this.topics.size,
            published: this._published,
            delivered: this._delivered,
            perTopic,
        };
    }
}

export const broker = new Broker();
