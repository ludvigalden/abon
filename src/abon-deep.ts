import React from "react";
import isEqual from "lodash/isEqual";
import get from "lodash/get";
import set from "lodash/set";
import merge from "lodash/merge";
import { PropertyPath } from "lodash";

import { NotifierDeep } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

/** Allows for setting, getting, and subscribing to deeply nested values. */
export class AbonDeep<T extends object> {
    current: T;

    constructor(initial?: T) {
        this.current = (initial || {}) as T;

        NotifierDeep.define(this);
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
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5], value: T[K1][K2][K3][K4][K5]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6], value: T[K1][K2][K3][K4][K5][K6]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, value: T[K1][K2][K3][K4][K5][K6][K7]): this;
    set<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
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
                notifier.notify(value, ...this.rootSubscriptionArgs);
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

    get(): T;
    get(keys: []): T;
    get<K extends keyof T>(key: K): T[K];
    get<K extends keyof T>(keys: [K]): T[K];
    get<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2): T[K1][K2];
    get<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2]): T[K1][K2];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(_1: K1, _2: K2, _3: K3): T[K1][K2][K3];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [K1, K2, K3]): T[K1][K2][K3];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
    ): T[K1][K2][K3][K4];
    get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
    ): T[K1][K2][K3][K4];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5): T[K1][K2][K3][K4][K5];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5]): T[K1][K2][K3][K4][K5];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6): T[K1][K2][K3][K4][K5][K6];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6]): T[K1][K2][K3][K4][K5][K6];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6): T[K1][K2][K3][K4][K5][K6][K7];
    get<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7]): T[K1][K2][K3][K4][K5][K6][K7];
    get(...args: any[]): any {
        const keys = AbonDeep.parseKeyArgs(args);

        if (!keys.length) {
            return this.current;
        } else {
            return AbonDeep.get(this.current, keys);
        }
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn;
    subscribe(keys: [], listener: ChangeListener<T>): UnsubscribeFn;
    subscribe<K extends keyof T>(key: K, listener: ChangeListener<T[K]>): UnsubscribeFn;
    subscribe<K extends keyof T>(keys: [K], listener: ChangeListener<T[K]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2, listener: ChangeListener<T[K1][K2]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2], listener: ChangeListener<T[K1][K2]>): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        _1: K1,
        _2: K2,
        _3: K3,
        listener: ChangeListener<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        keys: [K1, K2, K3],
        listener: ChangeListener<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    subscribe<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5], listener: ChangeListener<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    subscribe<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    subscribe(...args: any[]) {
        const { keys, value } = AbonDeep.parseKeyValueArgs(args);
        return NotifierDeep.get(this).subscribe(keys, value);
    }

    use(): this;
    use(keys: []): this;
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
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5): T[K1][K2][K3][K4][K5];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5]): T[K1][K2][K3][K4][K5];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6): T[K1][K2][K3][K4][K5][K6];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6]): T[K1][K2][K3][K4][K5][K6];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6): T[K1][K2][K3][K4][K5][K6][K7];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7]): T[K1][K2][K3][K4][K5][K6][K7];
    use(...args: any[]): any {
        const keys = AbonDeep.parseKeyArgs(args);
        const listener = useForceUpdate();

        if (!keys.length) {
            useClearedMemo(
                () => this.subscribe(listener),
                (unsubscribe) => unsubscribe(),
                [this, listener],
            );

            return this;
        } else {
            const value = React.useRef<T>();

            useClearedMemo(
                () => {
                    value.current = this.get(keys as any);

                    return this.subscribe(keys as any, (nextValue) => {
                        value.current = nextValue;
                        listener();
                    });
                },
                (unsubscribe) => unsubscribe(),
                [this, listener, value, NotifierDeep.get(this).key(keys)],
            );

            return value.current;
        }
    }

    useSubscription(listener: ChangeListener<T>): this;
    useSubscription(keys: [], listener: ChangeListener<T>): this;
    useSubscription<K extends keyof T>(key: K, listener: ChangeListener<T[K]>): this;
    useSubscription<K extends keyof T>(keys: [K], listener: ChangeListener<T[K]>): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2, listener: ChangeListener<T[K1][K2]>): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2], listener: ChangeListener<T[K1][K2]>): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        _1: K1,
        _2: K2,
        _3: K3,
        listener: ChangeListener<T[K1][K2][K3]>,
    ): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        keys: [K1, K2, K3],
        listener: ChangeListener<T[K1][K2][K3]>,
    ): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): this;
    useSubscription<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
        listener: ChangeListener<T[K1][K2][K3][K4]>,
    ): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, listener: ChangeListener<T[K1][K2][K3][K4][K5]>): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5], listener: ChangeListener<T[K1][K2][K3][K4][K5]>): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6]>): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): this;
    useSubscription<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7], listener: ChangeListener<T[K1][K2][K3][K4][K5][K6][K7]>): this;
    useSubscription(...args: any[]) {
        const { keys, value } = AbonDeep.parseKeyValueArgs(args);

        useClearedMemo(
            () => this.subscribe(keys as any, value),
            (unsubscribe) => unsubscribe(),
            [this, value, NotifierDeep.get(this).key(keys)],
        );

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

    get readonly(): ReadonlyAbonDeep<T> {
        return this;
    }

    static parseKeyValueArgs<T = any>(args: any[]): { keys: (keyof T)[]; value: any } {
        if (args.length === 1) {
            return { keys: [], value: args[0] };
        } else if (args.length === 2 && Array.isArray(args[0])) {
            return { keys: args[0], value: args[1] };
        } else {
            const value = args.pop();
            return { keys: args, value };
        }
    }

    static parseKeyArgs<T = any>(args: any[]): (keyof T)[] {
        if (args.length === 1 && Array.isArray(args[0])) {
            return args[0];
        } else {
            return args;
        }
    }

    static set<T>(object: object, path: readonly (keyof any)[], value: any) {
        return set<T>(object, path, value);
    }

    static get<T>(object: any, path: PropertyPath, defaultValue?: T | undefined): T {
        return get<T>(object, path, defaultValue as any);
    }
}

interface ReadonlyAbonDeep<T extends object> extends Omit<AbonDeep<T>, "set" | "notify" | "readonly" | "current" | "use"> {
    readonly current: T;
    use(): ReadonlyAbonDeep<T>;
    use(keys: []): ReadonlyAbonDeep<T>;
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
        K5 extends keyof T[K1][K2][K3][K4]
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
        K5 extends keyof T[K1][K2][K3][K4]
    >(
        keys: [K1, K2, K3, K4, K5],
    ): T[K1][K2][K3][K4][K5];
    use<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
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
        K6 extends keyof T[K1][K2][K3][K4][K5]
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
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
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
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(
        keys: [K1, K2, K3, K4, K5, K6, K7],
    ): T[K1][K2][K3][K4][K5][K6][K7];
}
