import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, Subscribeable } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

/** Retrieve and subscribe to a value. */
export class ReadonlyAbon<T> implements Subscribeable<T> {
    current: T;

    constructor(initial?: T) {
        this.current = initial as T;
        Notifier.define(this);
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        return Notifier.get<T>(this).subscribe(listener);
    }

    use() {
        const listener = useForceUpdate();

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
}
