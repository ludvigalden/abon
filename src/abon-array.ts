import React from "react";
import isEqual from "lodash/isEqual";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate, validateListener } from "./utils";

/** Subscribe to and update a normal array. */
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

    /** Removes the first item and returns it. */
    shift(): T | undefined {
        if (this.length > 0) {
            const shifted = super.shift();
            this.notify();
            return shifted;
        }

        return undefined;
    }

    /** Reverse the items */
    reverse(): this {
        this.set(this.current.reverse());
        return this;
    }

    splice(start: number, deleteCount?: number | undefined): T[] {
        const array = this.current;
        const spliced = array.splice(start, deleteCount);
        this.set(array);
        return spliced;
    }

    fill(value: T, start?: number | undefined, end?: number | undefined): this {
        this.set(this.current.fill(value, start, end));
        return this;
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
        return this.current.map(callbackfn);
    }

    /** Sorts the array */
    sort(compareFn?: (a: T, b: T) => number): this {
        return this.set(this.current.sort(compareFn));
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S): S[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(callbackfn: (value: T, index: number, array: T[]) => unknown): T[];
    filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S): S[] {
        return this.current.filter(callbackfn);
    }

    subscribe(listener: ChangeListener<T[]>): UnsubscribeFn {
        validateListener(listener);
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

    /** A read-only version of the instance (for typings). */
    get readonly(): ReadonlyAbonArray<T> {
        return this;
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

interface ReadonlyAbonArray<T>
    extends Omit<
        AbonArray<T>,
        "set" | "delete" | "push" | "unshift" | "reverse" | "notify" | "readonly" | "use" | "current" | "fill" | "pop" | "splice" | "shift"
    > {
    use(): ReadonlyAbonArray<T>;
    readonly current: T[];
}
