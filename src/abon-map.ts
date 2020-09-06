import React from "react";
import isEqual from "lodash/isEqual";
import useClearedMemo from "use-cleared-memo";

import { NotifierDeep } from "./notifier";
import { ChangeListener, UnsubscribeFn, ValueHandler } from "./types";
import { useForceUpdate, validateListener } from "./utils";

/** Subscribe to and set the entries of a `Map`. */
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

    subscribe(key: K, listener: ChangeListener<V>): UnsubscribeFn;
    subscribe(listener: ChangeListener<this>): UnsubscribeFn;
    subscribe(...args: any[]) {
        const handler = args.pop();
        validateListener(handler);
        return NotifierDeep.get(this).subscribe(args, handler);
    }

    handle(handler: ValueHandler<this>): UnsubscribeFn;
    handle(handler: ChangeListener<this>): UnsubscribeFn;
    handle(...args: any[]) {
        const handler = args.pop();
        validateListener(handler);
        handler(this);
        return NotifierDeep.get(this).subscribe(args, handler);
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

    useSubscription(key: K, listener: ChangeListener<V>, deps?: readonly any[]): void;
    useSubscription(listener: ChangeListener<this>, deps?: readonly any[]): void;
    useSubscription(...args: any[]) {
        let deps: readonly any[];
        let listener: ChangeListener<any>;
        const finalArg = args.pop();
        if (Array.isArray(finalArg)) {
            deps = finalArg;
            listener = args.pop();
        } else {
            deps = [];
            listener = finalArg;
        }
        useClearedMemo(
            () => this.subscribe(...(args.concat(listener) as [any])),
            (unsubscribe) => unsubscribe(),
            [this, args[0], ...deps],
        );
    }

    useHandler(key: K, handler: ValueHandler<V>): void;
    useHandler(handler: ValueHandler<this>): void;
    useHandler(...args: any[]) {
        let deps: readonly any[];
        let handler: ValueHandler<any>;
        const finalArg = args.pop();
        if (Array.isArray(finalArg)) {
            deps = finalArg;
            handler = args.pop();
        } else {
            deps = [];
            handler = finalArg;
        }
        useClearedMemo(
            () => this.handle(...(args.concat(handler) as [any])),
            (unsubscribe) => unsubscribe(),
            [this, args[0], ...deps],
        );
    }

    notify(keys?: K[]) {
        const notifier = NotifierDeep.get(this);

        notifier.notify([], this);

        Array.from(this.keys()).forEach((key) => {
            if (keys && !keys.includes(key)) {
                return;
            }
            notifier.notify([key as any], this.get(key));
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

    protected silentlySet(key: K, value: V): this {
        return super.set(key, value);
    }

    protected silentlyDelete(key: K) {
        return super.delete(key);
    }

    get readonly(): ReadonlyAbonMap<K, V> {
        return this;
    }

    static use<K, V>(initial?: () => readonly (readonly [K, V])[] | null, deps: readonly any[] = []): AbonMap<K, V> {
        return this.useRef(initial, deps).use();
    }

    static useRef<K, V>(initial?: () => readonly (readonly [K, V])[] | null, deps: readonly any[] = []): AbonMap<K, V> {
        return React.useMemo(() => new AbonMap(typeof initial === "function" ? initial() : undefined), deps);
    }
}

interface ReadonlyAbonMap<K, V> extends Omit<AbonMap<K, V>, "clear" | "notify" | "set" | "patch" | "delete" | "readonly" | "use"> {
    use(key: K): V | undefined;
    use(): ReadonlyAbonMap<K, V>;
}
