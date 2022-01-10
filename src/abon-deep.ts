import isEqual from "lodash/isEqual";
import merge from "lodash/merge";
import set from "lodash/set";
import React from "react";

import { NotifierDeep } from "./notifier-deep";
import { ReadonlyAbonDeep } from "./readonly-abon-deep";

/** Subscribe to, retrieve, and set deeply nested values. */
export class AbonDeep<T extends object> extends ReadonlyAbonDeep<T> {
    current: T;

    constructor(initial?: T) {
        super();

        this.current = (initial || {}) as T;
    }

    set(value: T): this;
    set(keys: [], value: T): this;
    set<K extends keyof T>(key: K, value: T[K]): this;
    set<K extends keyof T>(keys: [K], value: T[K]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2, value: T[K1][K2]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2], value: T[K1][K2]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(_1: K1, _2: K2, _3: K3, value: T[K1][K2][K3]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [K1, K2, K3], value: T[K1][K2][K3]): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        value: T[K1][K2][K3][K4],
    ): this;
    set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
        value: T[K1][K2][K3][K4],
    ): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
    >(keys: [K1, K2, K3, K4, K5], value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
    >(keys: [K1, K2, K3, K4, K5, K6], value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, value: T[K1][K2][K3][K4][K5][K6][K7]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    >(keys: [K1, K2, K3, K4, K5, K6, K7], value: T[K1][K2][K3][K4][K5][K6][K7]): this;
    set(...args: any[]) {
        const { keys, value } = AbonDeep.parseKeyValueArgs(args);

        let before: T;

        if (!keys.length) {
            before = this.current;

            this.current = value;

            if (isEqual(before, this.current)) {
                return;
            }
        } else {
            before = merge({}, this.current);

            const preValue = AbonDeep.get(before, keys);
            AbonDeep.set(this.current, keys, value);

            if (isEqual(preValue, value)) {
                return;
            }
        }

        const matches = NotifierDeep.get(this).getRelated(keys);

        Array.from(matches.entries()).forEach(([key, notifier]) => {
            if (!key.length) {
                // we know this value is not equal
                notifier.notify(this.current, ...this.rootSubscriptionArgs);
            } else if (key.length === keys.length && isEqual(key, keys)) {
                // we know this value is not equal
                notifier.notify(value);
                return;
            }

            const keyValueBefore = AbonDeep.get(before, key);
            const keyValue = AbonDeep.get(this.current, key);

            if (!isEqual(keyValueBefore, keyValue)) {
                notifier.notify(keyValue);
            }
        });

        return this;
    }

    notify(): this;
    notify(keys: (keyof any)[], ...args: any[]): this;
    notify(keys?: (keyof any)[], ...args: any[]) {
        const notifier = NotifierDeep.get(this);

        if (keys) {
            if (!keys.length) {
                if (!args.length) {
                    args.unshift(this.get(keys as any));
                }

                if (args.length === 1) {
                    args.push(...this.rootSubscriptionArgs);
                }
            } else {
                if (!args.length) {
                    args.unshift(this.get(keys as any));
                }
            }

            notifier.notify(keys, ...args);
        } else {
            Array.from(notifier.keys()).forEach((key) => {
                if (!key.length) {
                    notifier.notify(key, this.current, ...this.rootSubscriptionArgs);
                } else {
                    notifier.notify(key, this.get(key as any));
                }
            });
        }

        return this;
    }

    protected get rootSubscriptionArgs(): any[] {
        return [];
    }

    static set<T>(object: object, path: readonly (keyof any)[], value: any) {
        return set<T>(object, path, value);
    }

    static use<T extends object>(initial?: () => T, deps: readonly any[] = []) {
        return this.useRef(initial, deps).use();
    }

    static useRef<T extends object>(initial?: () => T, deps: readonly any[] = []): AbonDeep<T> {
        return React.useMemo(() => new AbonDeep((typeof initial === "function" ? initial() : undefined) as T), deps);
    }
}
