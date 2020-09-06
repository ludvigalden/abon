import isEqual from "lodash/isEqual";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, ValueHandler } from "./types";
import { useForceUpdate, useClearedMemo, validateListener } from "./utils";
import { PromiseDispatcher } from "./promise-dispatcher";

/** Subscribe to, retrieve, and asynchronously update a value, where an action to set a value can be interrupted.
 * `AbonAsync` is not intended to be used by itself, but rather to be extended and implementing the `set` method. */
export class AbonAsync<T> extends PromiseDispatcher<T> implements Omit<Abon<T>, "set" | "use"> {
    current: T;

    constructor(initial?: T) {
        super(initial);
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

    notify() {
        Notifier.get(this).notify(this.current);
    }

    protected setCurrent(value: T) {
        if (!isEqual(this.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }
    }
}
