import React from "react";
import isEqual from "lodash.isequal";

import { NotifierDeep, Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo } from "./utils";

export class AbonMap<K, V> extends Map<K, V> {
    private readonly $notifier: NotifierDeep;

    constructor(initial?: readonly (readonly [K, V])[] | null) {
        super(initial);

        Object.defineProperty(this, "$notifier", {
            value: new NotifierDeep(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
    }

    set(key: K, value: V): this;
    set(record: Record<K & keyof any, V>): this;
    set(entities: [K, V][]): this;
    set(...args: any[]) {
        if (args.length === 2) {
            const [key, value] = args;

            if (!this.has(key) || !isEqual(value, this.get(key))) {
                super.set(key, value);

                this.notify([key]);
            } else {
                super.set(key, value);
            }
        } else if (Array.isArray(args[0])) {
            const map = new Map(args[0] as [K, V][]);

            const notify: K[] = [];
            let notifyDelete = false;

            Array.from(this.keys()).forEach((currentKey) => {
                if (!map.has(currentKey)) {
                    super.delete(currentKey);
                    notifyDelete = true;
                }
            });

            Array.from(map.keys()).forEach((key) => {
                if (!this.has(key) || !isEqual(map.get(key), this.get(key))) {
                    super.set(key, map.get(key) as V);
                    notify.push(key);
                }
            });

            if (notify.length || notifyDelete) {
                this.notify(notify);
            }
        } else {
            const [record] = args as [Record<K & keyof any, V>];

            const notify: K[] = [];
            let notifyDelete = false;

            Array.from(this.keys()).forEach((currentKey) => {
                if (record[currentKey as never] === undefined) {
                    super.delete(currentKey);
                    notifyDelete = true;
                }
            });

            (Object.keys(record) as (K & keyof any)[]).forEach((key) => {
                if (!this.has(key) || !isEqual(record[key], this.get(key))) {
                    super.set(key, record[key]);

                    notify.push(key);
                }
            });

            if (notify.length || notifyDelete) {
                this.notify(notify);
            }
        }

        return this;
    }

    delete(key: K) {
        if (this.has(key)) {
            super.delete(key);
            this.notify([key]);

            return true;
        }

        return false;
    }

    subscribe(key: K, callback: ChangeListener<V>): UnsubscribeFn;
    subscribe(callback: ChangeListener<this>): UnsubscribeFn;
    subscribe(...args: any[]) {
        if (args.length === 1) {
            return this.$notifier.subscribe([], args[0]);
        } else {
            return this.$notifier.subscribe([args[0]], args[1]);
        }
    }

    use(key: K): V | undefined;
    use(): this;
    use(key?: K): V | undefined | this {
        const listener = React.useReducer(() => Object.create(null), undefined)[1];

        useClearedMemo(
            () => (key != null ? this.subscribe(key, listener) : this.subscribe(listener)),
            (unsubscribe) => unsubscribe(),
            [this, key, listener],
        );

        if (key != null) {
            return this.get(key);
        } else {
            return this;
        }
    }

    notify(keys?: K[]) {
        if (this.$notifier.has(NotifierDeep.notifierKeyDivider)) {
            (this.$notifier.get(NotifierDeep.notifierKeyDivider) as Notifier<this>).notify(this);
        }

        Array.from(this.keys()).forEach((key) => {
            if (keys && !keys.includes(key)) {
                return;
            }

            if (this.$notifier.has(key as any)) {
                (this.$notifier.get(key as any) as Notifier<V>).notify(this.get(key) as V);
            }
        });
    }

    clear() {
        super.clear();
        this.notify();
    }
}
