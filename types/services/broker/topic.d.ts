import { Subscriber } from './brokerTypes.js';
export declare class Topic {
    readonly name: string;
    private subscribers;
    published: number;
    delivered: number;
    constructor(name: string);
    add(sub: Subscriber): void;
    remove(subId: string): void;
    subscriberCount(): number;
    broadcast(frame: Omit<Subscriber['queue'][number], 'op'> & {
        op?: 'message';
    }): void;
    private drain;
    ejectAll(reason?: string): void;
}
