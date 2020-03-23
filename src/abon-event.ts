import React from "react";
import isEqual from "lodash/isEqual";

import { Listener, EventListener, EventPayloadListener, UnsubscribeFn } from "./types";
import { NotifierDeep } from "./notifier";
import { useClearedMemo } from "./utils";

export class AbonEvent<E, P = undefined> {
    protected readonly notifier = new NotifierDeep();

    subscribe(listener: EventListener<E, P>): UnsubscribeFn;
    subscribe(event: E, listener: EventPayloadListener<P>): UnsubscribeFn;
    subscribe(event: E, payload: P, listener: Listener): UnsubscribeFn;
    subscribe(...args: any[]): any {
        if (args.length === 3) {
            const [event, payload, listener] = args as [E, P, Listener];
            return this.notifier.subscribe([event as any], (notifiedPayload) => isEqual(payload, notifiedPayload) && listener());
        } else if (args.length === 2) {
            return this.notifier.subscribe([args[0]], args[1]);
        } else {
            return this.notifier.subscribe([], args[0]);
        }
    }

    notify(event: E): void;
    notify(event: E, payload: P): void;
    notify(event: E, payloads: P[]): void;
    notify(event: E, payload?: P | P[]) {
        if (Array.isArray(payload)) {
            payload.forEach((payloadItem) => this.notifier.notify([event] as any, payloadItem));
            this.notifier.notify([], event);
        } else {
            this.notifier.notify([event] as any, payload);
            this.notifier.notify([], event);
        }
    }

    use(listener: EventListener<E, P>, deps?: readonly any[]): UnsubscribeFn;
    use(event: E, listener: EventPayloadListener<P>, deps?: readonly any[]): UnsubscribeFn;
    use(event: E, payload: P, listener: Listener, deps?: readonly any[]): UnsubscribeFn;
    use(...args: any[]): any {
        const hasDeps = Array.isArray(args[args.length - 1]);

        useClearedMemo(
            () => {
                if (hasDeps) {
                    return this.subscribe(...(args.slice(0, args.length - 1) as [any]));
                } else {
                    return this.subscribe(...(args as [any]));
                }
            },
            (unsubscribe) => unsubscribe(),
            hasDeps ? [this, ...args[args.length - 1]] : [this],
        );
    }

    static use<E, P = undefined>(deps: readonly any[] = []): AbonEvent<E, P> {
        return React.useMemo(() => new AbonEvent(), deps);
    }
}
