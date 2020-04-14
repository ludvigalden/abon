import isEqual from "lodash/isEqual";

import { NotifierDeep, Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

/** A subscribeable implementation of a `Map`. */
export class AbonMap<K, V> extends Map<K, V> {
    constructor(initial?: readonly (readonly [K, V])[] | null) {
        super(initial);

        NotifierDeep.define(this);
    }

    set(key: K, value: V): this;
    /** Set the current entries, meaning entries that currently exist but do not exist in the passed `entries` will be deleted. */
    set(entries: [K, V][]): this;
    /** Set the current entries, meaning entries that currently exist but do not exist in the passed `record` will be deleted. */
    set(record: Record<K & keyof any, V>): this;
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

    /** Patch the current entries, meaning entries of the passed `entries` will be created or updated depending if they exist in the current entries. */
    patch(entries: [K, V][]): this;
    /** Patch the current entries, meaning entries of the passed `record` will be created or updated depending if they exist in the current entries. */
    patch(record: K extends keyof any ? Record<K & keyof any, V> : any): this;
    patch(...args: any[]) {
        if (Array.isArray(args[0])) {
            const map = new Map(args[0] as [K, V][]);

            const notify: K[] = [];

            Array.from(map.keys()).forEach((key) => {
                if (!this.has(key) || !isEqual(map.get(key), this.get(key))) {
                    super.set(key, map.get(key) as V);
                    notify.push(key);
                }
            });

            if (notify.length) {
                this.notify(notify);
            }
        } else {
            const record = args[0] as Record<K & keyof any, V>;

            const notify: K[] = [];

            (Object.keys(record) as (K & keyof any)[]).forEach((key) => {
                if (!this.has(key) || !isEqual(record[key], this.get(key))) {
                    super.set(key, record[key]);

                    notify.push(key);
                }
            });

            if (notify.length) {
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
            return NotifierDeep.get(this).subscribe([], args[0]);
        } else {
            return NotifierDeep.get(this).subscribe([args[0]], args[1]);
        }
    }

    use(key: K): V | undefined;
    use(): this;
    use(key?: K): V | undefined | this {
        const listener = useForceUpdate();

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
        if (NotifierDeep.get(this).has(NotifierDeep.notifierKeyDivider)) {
            (NotifierDeep.get(this).get(NotifierDeep.notifierKeyDivider) as Notifier<this>).notify(this);
        }

        Array.from(this.keys()).forEach((key) => {
            if (keys && !keys.includes(key)) {
                return;
            }

            if (NotifierDeep.get(this).has(key as any)) {
                (NotifierDeep.get(this).get(key as any) as Notifier<V>).notify(this.get(key) as V);
            }
        });
    }

    clear() {
        super.clear();
        this.notify();
    }

    get record(): K extends keyof any ? Record<K, V> : any {
        const record: any = {};

        Array.from(this.entries()).forEach(([key, value]) => {
            record[key] = value;
        });

        return record;
    }
}
