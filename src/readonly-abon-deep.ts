import React from "react";
import get from "lodash/get";
import { PropertyPath } from "lodash";

import { NotifierDeep } from "./notifier";
import { ChangeListener, ValueHandler, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate, validateListener } from "./utils";

/** Retrieve and subscribe to deeply nested values. */
export class ReadonlyAbonDeep<T extends object> {
    readonly current: T;

    constructor() {
        NotifierDeep.define(this);
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
        const keys = ReadonlyAbonDeep.parseKeyArgs(args);

        if (!keys.length) {
            return this.current;
        } else {
            return ReadonlyAbonDeep.get(this.current, keys);
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
        const { keys, value: listener } = ReadonlyAbonDeep.parseKeyValueArgs(args);
        validateListener(listener);
        return NotifierDeep.get(this).subscribe(keys, listener);
    }

    handle(handler: ValueHandler<T>): UnsubscribeFn;
    handle(keys: [], handler: ValueHandler<T>): UnsubscribeFn;
    handle<K extends keyof T>(key: K, handler: ValueHandler<T[K]>): UnsubscribeFn;
    handle<K extends keyof T>(keys: [K], handler: ValueHandler<T[K]>): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2, handler: ValueHandler<T[K1][K2]>): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2], handler: ValueHandler<T[K1][K2]>): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        _1: K1,
        _2: K2,
        _3: K3,
        handler: ValueHandler<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        keys: [K1, K2, K3],
        handler: ValueHandler<T[K1][K2][K3]>,
    ): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        handler: ValueHandler<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    handle<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
        handler: ValueHandler<T[K1][K2][K3][K4]>,
    ): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, handler: ValueHandler<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5], handler: ValueHandler<T[K1][K2][K3][K4][K5]>): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, handler: ValueHandler<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6], handler: ValueHandler<T[K1][K2][K3][K4][K5][K6]>): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, handler: ValueHandler<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    handle<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7], handler: ValueHandler<T[K1][K2][K3][K4][K5][K6][K7]>): UnsubscribeFn;
    handle(...args: any[]) {
        const { keys, value: handler } = ReadonlyAbonDeep.parseKeyValueArgs(args);
        validateListener(handler);
        handler(this.get(keys as [keyof T]));
        return NotifierDeep.get(this).subscribe(keys, handler);
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
        const keys = ReadonlyAbonDeep.parseKeyArgs(args);
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
        const { keys, value } = ReadonlyAbonDeep.parseKeyValueArgs(args);

        useClearedMemo(
            () => this.subscribe(keys as any, value),
            (unsubscribe) => unsubscribe(),
            [this, value, NotifierDeep.get(this).key(keys)],
        );

        return this;
    }

    useHandler(handler: ValueHandler<T>): this;
    useHandler(keys: [], handler: ValueHandler<T>): this;
    useHandler<K extends keyof T>(key: K, handler: ValueHandler<T[K]>): this;
    useHandler<K extends keyof T>(keys: [K], handler: ValueHandler<T[K]>): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1]>(_1: K1, _2: K2, handler: ValueHandler<T[K1][K2]>): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2], handler: ValueHandler<T[K1][K2]>): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        _1: K1,
        _2: K2,
        _3: K3,
        handler: ValueHandler<T[K1][K2][K3]>,
    ): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
        keys: [K1, K2, K3],
        handler: ValueHandler<T[K1][K2][K3]>,
    ): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        _1: K1,
        _2: K2,
        _3: K3,
        _4: K4,
        handler: ValueHandler<T[K1][K2][K3][K4]>,
    ): this;
    useHandler<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
        keys: [K1, K2, K3, K4],
        handler: ValueHandler<T[K1][K2][K3][K4]>,
    ): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, handler: ValueHandler<T[K1][K2][K3][K4][K5]>): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]
    >(keys: [K1, K2, K3, K4, K5], handler: ValueHandler<T[K1][K2][K3][K4][K5]>): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, handler: ValueHandler<T[K1][K2][K3][K4][K5][K6]>): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]
    >(keys: [K1, K2, K3, K4, K5, K6], handler: ValueHandler<T[K1][K2][K3][K4][K5][K6]>): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(_1: K1, _2: K2, _3: K3, _4: K4, _5: K5, _6: K6, _7: K6, handler: ValueHandler<T[K1][K2][K3][K4][K5][K6][K7]>): this;
    useHandler<
        K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]
    >(keys: [K1, K2, K3, K4, K5, K6, K7], handler: ValueHandler<T[K1][K2][K3][K4][K5][K6][K7]>): this;
    useHandler(...args: any[]) {
        const { keys, value } = ReadonlyAbonDeep.parseKeyValueArgs(args);

        useClearedMemo(
            () => this.handle(keys as any, value),
            (unsubscribe) => unsubscribe(),
            [this, value, NotifierDeep.get(this).key(keys)],
        );

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

    static get<T>(object: any, path: PropertyPath, defaultValue?: T | undefined): T {
        return get<T>(object, path, defaultValue as any);
    }
}
