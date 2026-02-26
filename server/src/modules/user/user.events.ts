import { EventEmitter } from 'events';

export const userEventEmitter = new EventEmitter();

export const USER_EVENTS = {
    USER_UPDATED: 'user:updated',
    USER_BLOCKED: 'user:blocked',
};
