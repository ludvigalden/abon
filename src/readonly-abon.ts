import { useClearedMemo } from "use-cleared-memo";

import { Notifier } from "./notifier";
import { ChangeListener, Subscribeable, UnsubscribeFn, ValueHandler } from "./types";
import { useMountedForceUpdate, validateListener } from "./utils";

/** Retrieve and subscribe to a value. */
export class ReadonlyAbon<T> implements Subscribeable<T> {
    readonly current: T;

    constructor() {
        Notifier.define(this);
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        validateListener(listener);
        return Notifier.get<T>(this).subscribe(listener);
    }

    handle(handler: ValueHandler<T>): UnsubscribeFn {
        validateListener(handler);
        handler(this.current);
        return this.subscribe(handler);
    }

    use() {
        const listener = useMountedForceUpdate();

        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, listener],
        );

        return this;
    }

    useSubscription(listener: ChangeListener<T>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    useHandler(handler: ValueHandler<T>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.handle(handler),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }
}
