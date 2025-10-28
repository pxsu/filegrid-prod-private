// lib/models/Shape.ts
import EventEmitter from 'eventemitter3';

export type PointerEvents =
    | 'none'
    | 'auto'
    | 'stroke'
    | 'fill'
    | 'painted'
    | 'visible'
    | 'all';

export abstract class Shape extends EventEmitter {
    id: string;
    pointerEvents: PointerEvents = 'auto';
    interactive: boolean = true;

    constructor() {
        super();
        this.id = crypto.randomUUID();
    }

    abstract containsPoint(x: number, y: number): boolean;

    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ) {
        const once = typeof options === 'object' && options?.once;
        const listenerFn = typeof listener === 'function' ? listener : listener.handleEvent;

        if (once) {
            this.once(type, listenerFn);
        } else {
            this.on(type, listenerFn);
        }
    }

    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
    ) {
        const listenerFn = typeof listener === 'function' ? listener : listener.handleEvent;
        this.off(type, listenerFn);
    }
}