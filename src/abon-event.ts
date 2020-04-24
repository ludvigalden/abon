import React from "react";
import isEqual from "lodash/isEqual";

import { Listener, EventListener, EventPayloadListener, UnsubscribeFn } from "./types";
import { Notifier } from "./notifier";
import { useClearedMemo } from "./utils";

/** Allows for subscribing to and notifying events and payloads. */
export class AbonEvent<E = undefined, P = undefined> {
    protected readonly notifier = new Notifier<E>();

    subscribe(listener: EventListener<E, P>): UnsubscribeFn;
    subscribe(event: E, listener: EventPayloadListener<P>): UnsubscribeFn;
    subscribe(event: E, payload: P, listener: Listener): UnsubscribeFn;
    subscribe(...args: any[]): any {
        if (args.length === 3) {
            const [event, payload, listener] = args as [E, P, Listener];

            return this.notifier.subscribe(
                ((notifiedEvent: E, notifiedPayload: P) =>
                    isEqual(notifiedEvent, event) && isEqual(notifiedPayload, payload) && listener()) as any,
            );
        } else if (args.length === 2) {
            const [event, listener] = args as [E, EventPayloadListener<P>];

            return this.notifier.subscribe(((notifiedEvent: E, payload: P) => isEqual(notifiedEvent, event) && listener(payload)) as any);
        } else {
            const listener: EventListener<E, P> = args[0];

            return this.notifier.subscribe(listener as any);
        }
    }

    notify(event: E): void;
    notify(event: E, payload: P): void;
    notify(event: E, payloads: P[]): void;
    notify(event: E, payload?: P | P[]) {
        if (Array.isArray(payload)) {
            payload.forEach((payloadItem) => {
                this.notifier.notify(event, payloadItem);
            });
        } else {
            this.notifier.notify(event, payload);
        }
    }

    use(listener: EventListener<E, P>, deps?: readonly any[]): UnsubscribeFn;
    use(event: E, listener: EventPayloadListener<P>, deps?: readonly any[]): UnsubscribeFn;
    use(event: E, payload: P, listener: Listener, deps?: readonly any[]): UnsubscribeFn;
    use(...args: any[]): any {
        const deps = args[args.length - 1];
        const hasDeps = Array.isArray(deps);

        useClearedMemo(
            () => {
                if (hasDeps) {
                    return this.subscribe(...(args.slice(0, args.length - 1) as [any]));
                } else {
                    return this.subscribe(...(args as [any]));
                }
            },
            (unsubscribe) => unsubscribe(),
            hasDeps ? [this, ...deps] : [this],
        );
    }

    get readonly(): ReadonlyAbonEvent<E, P> {
        return this;
    }

    get writeonly(): WriteonlyAbonEvent<E, P> {
        return this;
    }

    static use<E = undefined, P = undefined>(deps: readonly any[] = []): AbonEvent<E, P> {
        return React.useMemo(() => new AbonEvent(), deps);
    }
}

interface ReadonlyAbonEvent<E, P> extends Omit<AbonEvent<E, P>, "notify" | "readonly"> {}
interface WriteonlyAbonEvent<E, P> extends Pick<AbonEvent<E, P>, "notify"> {}
