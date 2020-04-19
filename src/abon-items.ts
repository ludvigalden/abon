import isEqual from "lodash/isEqual";
import uniqBy from "lodash/uniqBy";

import { AbonDeep } from "./abon-deep";
import { ChangeListener, UnsubscribeFn, ItemRecord, ItemRecordKey, ItemsChangeListener } from "./types";
import { Abon } from "./abon";

export class AbonItems<T extends object, I extends keyof T> extends AbonDeep<ItemRecord<T, I>>
    implements Pick<Array<T>, "find" | "findIndex" | "pop" | "values"> {
    ids: Abon<T[I][]>;

    constructor(readonly idKey: I, initial?: T[]) {
        super(AbonItems.record(initial || [], idKey));

        this.ids = new Abon(AbonItems.ids(initial || [], idKey));
    }

    set(items: T[]): this;
    set(current: ItemRecord<T, I>): this;
    set(id: T[I], item: T): this;
    set<K extends keyof T>(id: T[I], key: K, value: T[K]): this;
    set(...args: any[]): this {
        const { keys, value } = AbonDeep.parseKeyValueArgs(args);

        if (!keys.length) {
            if (!Array.isArray(value)) {
                let current: ItemRecord<T, I> = value;

                (Object.keys(current) as ItemRecordKey<T, I>[]).forEach((id) => {
                    if (!this.ids.current.includes(id)) {
                        if (current === args[0]) {
                            current = { ...args[0] };
                        }

                        delete current[id];
                    }
                });

                super.set(current);
            } else {
                let items: T[] = value;

                if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
                    const invalidItemIndex = items.findIndex((item) => !item || item[this.idKey] == null);

                    if (invalidItemIndex >= 0) {
                        throw new Error(
                            `An invalid item was passed at index ${invalidItemIndex}: \n\t` +
                                "[" +
                                items.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                                "]",
                        );
                    }
                }

                items = uniqBy(items, (item) => item[this.idKey]);

                const ids: T[I][] = items.map((item) => item[this.idKey]);
                const current = AbonItems.record(items, this.idKey);

                const notifyIds = !isEqual(ids, this.ids.current);

                this.ids.current = ids;

                super.set(current);

                if (notifyIds) {
                    this.ids.notify();
                }
            }
        } else {
            if (!this.ids.current.includes(keys[0] as any)) {
                return this;
            }

            return super.set(keys as any, value);
        }

        return this;
    }

    delete(...ids: T[I][]) {
        return this.set(this.array.filter((item) => !item || !ids.includes(item[this.idKey])));
    }

    push(...items: T[]): number {
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
            const undefinedItemIndex = this.array.findIndex((item) => !item || item[this.idKey] == null);

            if (undefinedItemIndex >= 0) {
                throw new Error(
                    `An invalid item exists at at index ${undefinedItemIndex} (mismatch between ids and defined items). Was AbonItems.current or AbonItems.ids mutated incorrectly?` +
                        "\n\titems: [" +
                        this.array.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                        `]\n\tcurrent: {` +
                        Object.keys(this.current)
                            .map((id) => ` ${id}: {...} `)
                            .join(",") +
                        `}\n\tids: [${this.ids.current.join(", ")}]`,
                );
            }
        }

        items = uniqBy(items, (item) => item[this.idKey]);

        const pushedIds = items.map((item) => item[this.idKey]);

        this.set(
            this.ids.current
                .filter((id) => !pushedIds.includes(id))
                .map((id) => this.current[id as ItemRecordKey<T, I>])
                .concat(...items),
        );

        return this.length;
    }

    unshift(...items: T[]): number {
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
            const undefinedItemIndex = this.array.findIndex((item) => !item || item[this.idKey] == null);

            if (undefinedItemIndex >= 0) {
                throw new Error(
                    `An invalid item exists at at index ${undefinedItemIndex} (mismatch between ids and defined items). Was AbonItems.current or AbonItems.ids mutated incorrectly?` +
                        "\n\titems: [" +
                        this.array.map((item) => (!item || item[this.idKey] == null ? "null" : String(item[this.idKey]))).join(", ") +
                        `]\n\tcurrent: {` +
                        Object.keys(this.current)
                            .map((id) => ` ${id}: {...} `)
                            .join(",") +
                        `}\n\tids: [${this.ids.current.join(", ")}]`,
                );
            }
        }

        items = uniqBy(items, (item) => item[this.idKey]);

        const unshiftedIds = items.map((item) => item[this.idKey]);

        this.set(
            items.concat(
                ...this.ids.current.filter((id) => !unshiftedIds.includes(id)).map((id) => this.current[id as ItemRecordKey<T, I>]),
            ),
        );

        return this.length;
    }

    has(id: T[I]) {
        return Boolean(this.current[id as ItemRecordKey<T, I>]);
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
        K5 extends keyof T[K1][K2][K3][K4]
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [T[I], K1, K2, K3, K4, K5], listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(id: T[I], _1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [T[I], K1, K2, K3, K4, K5, K6], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
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
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [T[I], K1, K2, K3, K4, K5, K6, K7], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    subscribe(...args: any[]) {
        return super.subscribe(...(args as [any]));
    }

    notify(): this;
    notify(keys: (keyof any)[], ...args: any[]): this;
    notify(keys?: (keyof any)[], ...args: any[]) {
        if (keys && !keys.length && args.length === 1) {
            super.notify(keys, args[0], this.array, this.ids.current);
        } else {
            super.notify(keys as any, ...args);
        }

        return this;
    }

    find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
    find(...args: any[]): any {
        return this.array.find(...(args as [any]));
    }

    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
    findIndex(...args: any[]): any {
        return this.array.findIndex(...(args as [any]));
    }

    /** Remove the last item */
    pop(): T | undefined {
        const pop = this.ids.current[this.ids.current.length - 1];

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

    values(): IterableIterator<T> {
        return this.array.values();
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.array[Symbol.iterator]();
    }

    get array() {
        return this.ids.current.map((id): T => this.current[id as ItemRecordKey<T, I>]);
    }

    get length() {
        return this.ids.current.length;
    }

    static record<T extends object, I extends keyof T>(items: T[], idKey: I) {
        const record: ItemRecord<T, I> = {} as any;

        items.forEach((item) => {
            record[item[idKey] as ItemRecordKey<T, I>] = item;
        });

        return record;
    }

    static ids<T extends object, I extends keyof T>(items: T[], idKey: I) {
        return items.map((item) => (!item ? item : item[idKey]));
    }
}
