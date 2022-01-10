import isEqual from "lodash/isEqual";
import uniqBy from "lodash/uniqBy";
import React from "react";

import { AbonArray } from "./abon-array";
import { AbonDeep } from "./abon-deep";
import { ChangeListener, ItemRecord, ItemRecordKey, ItemsChangeListener, UnsubscribeFn } from "./types";

/** Subscribe to and update an ordered list of identifiable objects. */
export class AbonItems<T extends object, I extends keyof T>
    extends AbonDeep<ItemRecord<T, I>>
    implements
        Pick<
            Array<T>,
            | "find"
            | "findIndex"
            | "pop"
            | "values"
            | "forEach"
            | "map"
            | "indexOf"
            | "lastIndexOf"
            | "every"
            | "some"
            | "filter"
            | "includes"
            | "length"
        >
{
    ids: AbonArray<T[I]>["readonly"];

    constructor(readonly idKey: I, initial?: T[]) {
        super(AbonItems.record(initial || [], idKey));

        this.ids = new AbonArray(AbonItems.ids(initial || [], idKey)).readonly;
    }

    /** Set the items */
    set(items: T[]): this;
    /** Update existing items */
    set(current: ItemRecord<T, I>): this;
    /** Update existing items */
    set(keys: [], value: ItemRecord<T, I>): this;
    /** Update an existing item */
    set(id: T[I], item: T): this;
    /** Set a value of an existing item */
    set<K extends keyof T>(id: T[I], key: K, value: T[K]): this;
    set<K extends keyof T>(keys: [T[I], K], value: T[K]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1]>(id: T[I], _1: K1, _2: K2, value: T[K1][K2]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [T[I], K1, K2], value: T[K1][K2]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        value: T[K1][K2][K3],
    ): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [K1, K2, K3], value: T[K1][K2][K3]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        value: T[K1][K2][K3][K4],
    ): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [T[I], K1, K2, K3, K4],
        value: T[K1][K2][K3][K4],
    ): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(keys: [T[I], K1, K2, K3, K4, K5], value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6], value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, value: T[K1][K2][K3][K4][K5][K6][K7]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6, K7], value: T[K1][K2][K3][K4][K5][K6][K7]): this;
    set(...args: any[]): this {
        const { keys, value } = AbonDeep.parseKeyValueArgs(args);

        if (!keys.length) {
            if (!Array.isArray(value)) {
                let current: ItemRecord<T, I> = value || {};

                (Object.keys(current) as ItemRecordKey<T, I>[]).forEach((id) => {
                    if (!this.ids.includes(id)) {
                        if (current === value) {
                            current = { ...value };
                        }

                        delete current[id];
                    }
                });

                super.set(current);
            } else {
                let items: T[] = value;

                const invalidItemIndex = items.findIndex((item) => !item || item[this.idKey] == null);
                if (invalidItemIndex >= 0) {
                    const error =
                        `An invalid item was passed at index ${invalidItemIndex}: \n\t` +
                        "[" +
                        items.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                        "]";
                    throw new Error(error);
                }

                items = uniqBy(items, (item) => item[this.idKey]);

                const ids: T[I][] = items.map((item) => item[this.idKey]);
                const current = AbonItems.record(items, this.idKey);

                const notifyIds = !isEqual(ids, this.ids.current);
                // if the ids are unequal but the current is equal, the order of the items has changed
                // and AbonDeep will not notify root subscriptions
                const notifyRoot = notifyIds && !isEqual(current, this.current);

                this.internalIds.current = ids;

                super.set(current);

                if (notifyRoot) {
                    this.notify([]);
                }

                if (notifyIds) {
                    this.internalIds.notify();
                }
            }
        } else {
            if (!this.ids.current.includes(keys[0] as any)) {
                return this;
            }

            super.set(keys as any, value);
            return this;
        }

        return this;
    }

    /** Deletes items from the list and ensures the right order of remaining items */
    delete(...ids: T[I][]): this;
    delete(...items: T[]): this;
    delete(...idsOrItems: (T | T[I])[]): this;
    delete(...idsOrItems: (T | T[I])[]) {
        const ids = idsOrItems
            .filter((idOrItem) => idOrItem != null)
            .map((idOrItem) => (typeof idOrItem === "object" ? (idOrItem as T)[this.idKey] : idOrItem));

        return this.set(this.filter((item) => !item || !ids.includes(item[this.idKey])));
    }

    /**
     * Appends new items to the end of the list and returns the new amonut of items.
     * @param items New items to append.
     */
    push(...items: T[]): number {
        const undefinedItemIndex = this.array.findIndex((item) => !item || item[this.idKey] == null);
        if (undefinedItemIndex >= 0) {
            const error =
                `An invalid item exists at at index ${undefinedItemIndex} (mismatch between ids and defined items). Was AbonItems.current or AbonItems.ids mutated incorrectly?` +
                "\n\titems: [" +
                this.array.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                `]\n\tcurrent: {` +
                Object.keys(this.current)
                    .map((id) => ` ${id}: {...} `)
                    .join(",") +
                `}\n\tids: [${this.ids.current.join(", ")}]`;
            throw new Error(error);
        }

        items = uniqBy(items, (item) => item[this.idKey]);

        const pushedIds = items.map((item) => item[this.idKey]);

        this.set(
            this.ids
                .filter((id) => !pushedIds.includes(id))
                .map((id) => this.current[id as ItemRecordKey<T, I>])
                .concat(...items),
        );

        return this.length;
    }

    /**
     * Inserts new items at the start of the list.
     * @param items  New items to insert at the start of the list.
     */
    unshift(...items: T[]): number {
        const undefinedItemIndex = this.array.findIndex((item) => !item || item[this.idKey] == null);
        if (undefinedItemIndex >= 0) {
            const error =
                `An invalid item exists at at index ${undefinedItemIndex} (mismatch between ids and defined items). Was AbonItems.current or AbonItems.ids mutated incorrectly?` +
                "\n\titems: [" +
                this.array.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                `]\n\tcurrent: {` +
                Object.keys(this.current)
                    .map((id) => ` ${id}: {...} `)
                    .join(",") +
                `}\n\tids: [${this.ids.current.join(", ")}]`;
            throw new Error(error);
        }

        items = uniqBy(items, (item) => item[this.idKey]);

        const unshiftedIds = items.map((item) => item[this.idKey]);

        this.set(items.concat(...this.ids.filter((id) => !unshiftedIds.includes(id)).map((id) => this.current[id as ItemRecordKey<T, I>])));

        return this.length;
    }

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
    find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S): S | undefined;
    find(predicate: (value: T, index: number, obj: T[]) => unknown): T | undefined;
    find(...args: any[]): any {
        return this.array.find(...(args as [any]));
    }

    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     */
    includes(item: T): boolean;
    includes(id: T[I]): boolean;
    includes(thunk: T | T[I]): boolean {
        const id = (thunk && typeof thunk === "object" ? (thunk as T)[this.idKey] : thunk) as T[I];
        return this.ids.includes(id);
    }

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     */
    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown): number {
        return this.array.findIndex(predicate);
    }

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(item: T, fromIndex?: number): number;
    indexOf(id: T[I], fromIndex?: number): number;
    indexOf(thunk: T | T[I], fromIndex?: number): number;
    indexOf(thunk: T | T[I], fromIndex?: number): number {
        const id = (thunk && typeof thunk === "object" ? (thunk as T)[this.idKey] : thunk) as T[I];
        return this.ids.indexOf(id, fromIndex);
    }

    /**
     * Returns the index of the last occurrence of a specified value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
     */
    lastIndexOf(item: T, fromIndex?: number): number;
    lastIndexOf(id: T[I], fromIndex?: number): number;
    lastIndexOf(thunk: T | T[I], fromIndex?: number): number;
    lastIndexOf(thunk: T | T[I], fromIndex?: number): number {
        const id = thunk && typeof thunk === "object" ? (thunk as T)[this.idKey] : thunk;
        return this.array.lastIndexOf(id as any, fromIndex);
    }

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param callbackfn A function that accepts up to three arguments. The every method calls
     * the callbackfn function for each element in the array until the callbackfn returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     */
    every(callbackfn: (value: T, index: number, array: T[]) => unknown): boolean {
        return this.array.every(callbackfn);
    }

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param callbackfn A function that accepts up to three arguments. The some method calls
     * the callbackfn function for each element in the array until the callbackfn returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     */
    some(callbackfn: (value: T, index: number, array: T[]) => unknown): boolean {
        return this.array.some(callbackfn);
    }

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     */
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
        this.array.forEach(callbackfn);
    }

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
        return this.array.map(callbackfn);
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
        return this.array.filter(callbackfn);
    }

    /** Removes the last item and returns it. */
    pop(): T | undefined {
        const pop = this.ids[this.ids.current.length - 1];

        if (pop != null) {
            const value = this.get(pop as ItemRecordKey<T, I>);
            this.delete(pop);
            return value;
        } else {
            return undefined;
        }
    }

    /** Reverse the items */
    reverse(): this {
        this.set(this.array.reverse());
        return this;
    }

    /** Returns an iterable of the items */
    values(): IterableIterator<T> {
        return this.array.values();
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.array[Symbol.iterator]();
    }

    /** The values of the set items in the same order as the `ids` */
    get array() {
        return this.ids.map((id): T => this.current[id as ItemRecordKey<T, I>]);
    }

    get length() {
        return this.ids.length;
    }

    subscribe(listener: ItemsChangeListener<T, I>): UnsubscribeFn;
    subscribe(keys: [], listener: ItemsChangeListener<T, I>): UnsubscribeFn;
    subscribe(id: T[I], listener: ChangeListener<T>): UnsubscribeFn;
    subscribe(keys: [T[I]], listener: ChangeListener<T>): UnsubscribeFn;
    subscribe<K extends keyof T>(id: T[I], key: K, listener: ChangeListener<T[K]>): UnsubscribeFn;
    subscribe<K extends keyof T>(keys: [T[I], K], listener: ChangeListener<T[K]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1]>(id: T[I], _1: K1, _2: K2, listener: ChangeListener<T[K1][K2]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [T[I], K1, K2], listener: ChangeListener<T[K1][K2]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        listener: ChangeListener<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        keys: [T[I], K1, K2, K3],
        listener: ChangeListener<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [T[I], K1, K2, K3, K4],
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(keys: [T[I], K1, K2, K3, K4, K5], listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        _5: K5,
        _6: K6,
        _7: K6,
        listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>,
    ): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6, K7], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    subscribe(...args: any[]) {
        return super.subscribe(...(args as [any]));
    }

    get(): ItemRecord<T, I>;
    get(keys: []): ItemRecord<T, I>;
    get(id: T[I]): T;
    get(keys: [T[I]]): T;
    get<K extends keyof T>(id: T[I], key: K): T[K];
    get<K extends keyof T>(keys: [T[I], K]): T[K];
    get<K1 extends keyof T, K2 extends keyof T[K1]>(id: T[I], _1: K1, _2: K2): T[K1][K2];
    get<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [T[I], K1, K2]): T[K1][K2];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(id: T[I], _1: K1, _2: K2, _3: K3): T[K1][K2][K3];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [T[I], K1, K2, K3]): T[K1][K2][K3];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        id: T[I],
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
    ): T[K1][K2][K3][K4];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [T[I], K1, K2, K3, K4],
    ): T[K1][K2][K3][K4];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5): T[K1][K2][K3][K4][K5];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(keys: [T[I], K1, K2, K3, K4, K5]): T[K1][K2][K3][K4][K5];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6): T[K1][K2][K3][K4][K5][K6];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6]): T[K1][K2][K3][K4][K5][K6];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6): T[K1][K2][K3][K4][K5][K6][K7];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(keys: [T[I], K1, K2, K3, K4, K5, K6, K7]): T[K1][K2][K3][K4][K5][K6][K7];
    get(...args: any[]): any {
        return super.get(...(args as [any]));
    }

    protected get rootSubscriptionArgs() {
        return [this.array, this.ids.current];
    }

    private get internalIds(): AbonArray<T[I]> {
        return this.ids as any;
    }

    get readonly(): ReadonlyAbonItems<T, I> {
        return this;
    }

    static record<T extends object, I extends keyof T>(items: T[], idKey: I) {
        const record: ItemRecord<T, I> = {} as any;

        items.forEach((item) => {
            record[item[idKey] as ItemRecordKey<T, I>] = item;
        });

        return record;
    }

    static ids<T extends object, I extends keyof T>(items: T[], idKey: I): T[I][] {
        return items.map((item) => (!item ? (item as any) : item[idKey]));
    }

    static use<T extends object, I extends keyof T>(idKey: I, initial?: () => T[], deps?: readonly any[]): AbonItems<T, I>;
    static use<T extends object>(initial?: () => T, deps?: readonly any[]): AbonDeep<T>;
    static use(...args: any[]) {
        return this.useRef(...(args as [any])).use();
    }

    static useRef<T extends object, I extends keyof T>(idKey: I, initial?: () => T[], deps?: readonly any[]): AbonItems<T, I>;
    static useRef<T extends object>(initial?: () => T, deps?: readonly any[]): AbonDeep<T>;
    static useRef(...args: any[]): any {
        if (typeof args[0] === "function" || !args[0]) {
            return super.useRef(...(args as [any]));
        }
        return React.useMemo(
            () => new AbonItems(args[0] as never, typeof args[1] === "function" ? args[1]() : undefined),
            (args[3] || []).concat(args[0]),
        );
    }
}

interface ReadonlyAbonItems<T extends object, I extends keyof T>
    extends Omit<
        AbonItems<T, I>,
        "set" | "notify" | "readonly" | "pop" | "push" | "unshift" | "set" | "delete" | "ids" | "current" | "notify" | "use" | "reverse"
    > {
    ids: AbonArray<T[I]>["readonly"];
    readonly current: ItemRecord<T, I>;
    use(): ReadonlyAbonItems<T, I>;
    use(keys: []): ReadonlyAbonItems<T, I>;
    use<K extends keyof T>(key: K): T[K];
    use<K extends keyof T>(keys: [K]): T[K];
    use<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2): T[K1][K2];
    use<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2]): T[K1][K2];
    use<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(_1: K1, _2: K2, _3: K3): T[K1][K2][K3];
    use<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [K1, K2, K3]): T[K1][K2][K3];
    use<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
    ): T[K1][K2][K3][K4];
    use<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
    ): T[K1][K2][K3][K4];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        _5: K5,
    ): T[K1][K2][K3][K4][K5];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(
        keys: [K1, K2, K3, K4, K5],
    ): T[K1][K2][K3][K4][K5];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        _5: K5,
        _6: K6,
    ): T[K1][K2][K3][K4][K5][K6];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(
        keys: [K1, K2, K3, K4, K5, K6],
    ): T[K1][K2][K3][K4][K5][K6];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        _5: K5,
        _6: K6,
        _7: K6,
    ): T[K1][K2][K3][K4][K5][K6][K7];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(
        keys: [K1, K2, K3, K4, K5, K6, K7],
    ): T[K1][K2][K3][K4][K5][K6][K7];
}
