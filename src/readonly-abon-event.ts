import useClearedMemo from "use-cleared-memo";

import { Listener, EventListener, EventPayloadListener, UnsubscribeFn } from "./types";
import { Notifier } from "./notifier";
import { validateListener } from "./utils";

/** Subscribe to events and payloads. */
export class ReadonlyAbonEvent<E = undefined, P = undefined> {
    constructor() {
        Notifier.define(this);
    }

    subscribe(listener: EventListener<E, P>): UnsubscribeFn;
    subscribe(event: E, listener: EventPayloadListener<P>): UnsubscribeFn;
    subscribe(event: E, payload: P, listener: Listener): UnsubscribeFn;
    subscribe(...args: any[]): any {
        if (args.length === 3) {
            const [event, payload, listener] = args as [E, P, Listener];
            validateListener(listener);
            return Notifier.get(this).subscribe(
                ((notifiedEvent: E, notifiedPayload: P) => notifiedEvent === event && notifiedPayload === payload && listener()) as any,
            );
        } else if (args.length === 2) {
            const [event, listener] = args as [E, EventPayloadListener<P>];
            validateListener(listener);
            return Notifier.get(this).subscribe(((notifiedEvent: E, payload: P) => notifiedEvent === event && listener(payload)) as any);
        } else {
            const listener: EventListener<E, P> = args[0];
            validateListener(listener);
            return Notifier.get(this).subscribe(listener as any);
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
}
