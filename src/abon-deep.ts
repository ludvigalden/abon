import React from "react";
import isEqual from "lodash/isEqual";
import get from "lodash/get";
import set from "lodash/set";

import { NotifierDeep } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

/** Allows for setting, getting, and subscribing to deeply nested values. */
export class AbonDeep<T extends object> {
    current: T;

    private readonly $notifier: NotifierDeep;

    constructor(initial?: T) {
        this.current = (initial || {}) as T;

        Object.defineProperty(this, "$notifier", {
            value: new NotifierDeep(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
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
        const { keys, value } = parseKeyValueArgs(args);

        if (!keys.length) {
            if (!isEqual(value, this.current)) {
                const before = this.current;
                this.current = value;

                Array.from(this.$notifier.keys()).forEach((notifierKey) => {
                    if (notifierKey === NotifierDeep.notifierKeyDivider) {
                        this.$notifier.notify([], this.current);
                    } else {
                        const keys = NotifierDeep.parseNotifierKey(notifierKey);

                        const valueBefore = get(before, keys);
                        const valueNext = get(value, keys);

                        if (!isEqual(valueBefore, valueNext)) {
                            this.$notifier.notify(keys, valueNext);
                        }
                    }
                });
            } else {
                this.current = value;
            }
        } else {
            const preValue = get(this.current, keys);

            if (!isEqual(preValue, value)) {
                set(this.current, keys, value);

                this.$notifier.notify([], this.current);

                keys.forEach((_, i) => {
                    const notifyKeys = keys.slice(0, i + 1);

                    this.$notifier.notify(notifyKeys as any, get(this.current, notifyKeys as any));
                });

                const notifierKey = NotifierDeep.formatNotifierKey(args);

                Array.from(this.$notifier.keys()).forEach((_anyNotifierKey) => {
                    const anyNotifierKey = String(_anyNotifierKey);

                    if (anyNotifierKey.length <= notifierKey.length || anyNotifierKey.substr(0, notifierKey.length) !== notifierKey) {
                        return;
                    }

                    const valueChildKeys = NotifierDeep.parseNotifierKey(anyNotifierKey).slice(keys.length);

                    if (!isEqual(get(preValue, valueChildKeys), get(value, valueChildKeys))) {
                        this.$notifier.notify([...keys, ...valueChildKeys], get(value, valueChildKeys));
                    }
                });
            }
        }

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
        const keys = parseKeyArgs(args);

        if (!keys.length) {
            return this.current;
        } else {
            return get(this.current, keys);
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
        const { keys, value } = parseKeyValueArgs(args);
        return this.$notifier.subscribe(keys, value);
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
        const keys = parseKeyArgs(args);
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
                [this, listener, value, NotifierDeep.formatNotifierKey(keys)],
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
        const { keys, value } = parseKeyValueArgs(args);

        useClearedMemo(
            () => this.subscribe(keys as any, value),
            (unsubscribe) => unsubscribe(),
            [this, value, NotifierDeep.formatNotifierKey(keys)],
        );

        return this;
    }

    notify() {
        Array.from(this.$notifier.keys()).forEach((notifierKey) => {
            if (notifierKey === NotifierDeep.notifierKeyDivider) {
                this.$notifier.notify([], this.current);
            } else {
                const keys = NotifierDeep.parseNotifierKey(notifierKey) as any;
                this.$notifier.notify(keys, this.get(keys));
            }
        });
    }
}

function parseKeyValueArgs(args: any[]): { keys: (keyof any)[]; value: any } {
    if (args.length === 1) {
        return { keys: [], value: args[0] };
    } else if (args.length === 2 && Array.isArray(args[0])) {
        return { keys: args[0], value: args[1] };
    } else {
        const value = args.pop();
        return { keys: args, value };
    }
}

function parseKeyArgs(args: any[]): (keyof any)[] {
    if (args.length === 1 && Array.isArray(args[0])) {
        return args[0];
    } else {
        return args;
    }
}
