import { Subscriber, Stats, WS } from './brokerTypes.js';
export declare class Broker {
    private topics;
    private clients;
    private _published;
    private _delivered;
    private readonly startedAt;
    createTopic(name: string): boolean;
    deleteTopic(name: string): boolean;
    listTopics(): string[];
    attachClient(socket: WS, maxQueue?: number): Subscriber;
    detachClient(subId: string): void;
    subscribe(sub: Subscriber, topicName: string): void;
    unsubscribe(sub: Subscriber, topicName: string): void;
    publish(topicName: string, data: unknown): boolean;
    stats(): Stats;
}
export declare const broker: Broker;
