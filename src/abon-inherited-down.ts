import isEqual from "lodash/isEqual";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useForceUpdate, useClearedMemo } from "./utils";

/** Inherits a value from parents if the current value is undefined. */
export class AbonInheritedDown<T> implements Abon<T> {
    protected readonly parent?: Abon<T>;
    protected readonly value: Abon<T>;

    constructor(initial?: T, parent?: Abon<T>) {
        this.value = new Abon(initial);
        this.parent = parent;
        Notifier.define(this);
    }

    set(value: T) {
        if (!isEqual(this.value.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }

        return this;
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        return Abon.composedSubscription(
            () => listener(this.current),
            (composedListener) => [
                Notifier.get<T>(this.value).subscribe(composedListener),
                this.parent ? Notifier.get<T>(this.parent).subscribe(composedListener) : undefined,
            ],
        );
    }

    nest() {
        return new AbonInheritedDown(undefined, this);
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

    get current() {
        const value = this.value.current;
        if (value === undefined && this.parent) {
            return this.parent.current;
        }
        return value;
    }

    set current(value: T) {
        this.value.current = value;
    }
}
