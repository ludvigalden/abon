import React from "react";
import isEqual from "lodash/isEqual";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

export class AbonArray<T> extends Array<T> {
    constructor(initial: Iterable<T> = []) {
        super(...Array.from(initial));

        Notifier.define(this);
    }

    set(items: T[]) {
        if (!isEqual(this.current, items)) {
            this.current = items;
            Notifier.get<T[]>(this).notify(items);
        }

        return this;
    }

    /** Deletes items from the array */
    delete(...items: T[]): this {
        return this.set(this.filter((value) => !items.includes(value)));
    }

    /**
     * Appends new items to the end of the list and returns the new amonut of items.
     * @param items New items to append.
     */
    push(...items: T[]): number {
        super.push(...items);
        this.notify();
        return this.length;
    }

    /**
     * Inserts new items at the start of the list.
     * @param items  New items to insert at the start of the list.
     */
    unshift(...items: T[]): number {
        super.unshift(...items);
        this.notify();
        return this.length;
    }

    /** Removes the last item and returns it. */
    pop(): T | undefined {
        if (this.length > 0) {
            const popped = super.pop();
            this.notify();
            return popped;
        }

        return undefined;
    }

    /** Reverse the items */
    reverse(): this {
        this.set(this.current.reverse());
        return this;
    }

    subscribe(listener: ChangeListener<T[]>): UnsubscribeFn {
        return Notifier.get<T[]>(this).subscribe(listener);
    }

    get current() {
        return Array.from(this);
    }

    set current(items: T[]) {
        super.splice(0);
        super.push(...items);
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

    useSubscription(listener: ChangeListener<T[]>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    notify() {
        Notifier.get(this).notify(this.current);
    }

    static use<T>(initial?: () => T[], deps: readonly any[] = []): AbonArray<T> {
        return AbonArray.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => T[], deps: readonly any[] = []): AbonArray<T> {
        return React.useMemo(() => new AbonArray(typeof initial === "function" ? initial() : undefined), deps);
    }
}
