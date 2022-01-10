import isEqual from "lodash/isEqual";

import { Notifier } from "./notifier";
import { ChangeListener } from "./types";

export class NotifierDeep extends Map<Key[], Notifier<unknown>> {
    getNotifier<T = unknown>(keys: Key[]): { key: Key[]; notifier: Notifier<T> } {
        const key = this.key(keys);

        if (super.has(key)) {
            return { notifier: super.get(key) as Notifier<T>, key };
        } else {
            const notifier = new Notifier<T>();
            super.set(key, notifier as Notifier<unknown>);
            return { notifier, key: keys };
        }
    }

    subscribe<T = unknown>(keys: Key[], listener: ChangeListener<T>) {
        const { notifier, key } = this.getNotifier<T>(keys);

        notifier.add(listener);

        return () => {
            notifier.delete(listener);

            if (notifier && !notifier.size) {
                super.delete(key);
            }
        };
    }

    key(keys: Key[]) {
        const key = Array.from(this.keys()).find((key) => key.length === keys.length && isEqual(keys, key));
        return key || keys;
    }

    has(keys: Key[]) {
        return super.has(this.key(keys));
    }

    get<T = unknown>(keys: Key[]): Notifier<T> {
        return super.get(this.key(keys)) as Notifier<T>;
    }

    /** Gets related keys and notifiers */
    getRelated(keys: Key[]): Map<Key[], Notifier<unknown>> {
        if (!keys.length) {
            return this;
        }

        const related = new Map<Key[], Notifier<unknown>>();

        // parent keys
        for (let i = 0; i < keys.length; i++) {
            const parentKey = this.key(keys.slice(0, i));

            if (super.has(parentKey)) {
                related.set(parentKey, super.get(parentKey) as Notifier<unknown>);
            }
        }

        const key = this.key(keys);
        if (super.has(key)) {
            related.set(key, super.get(key) as Notifier<unknown>);
        }

        // parent or same keys keys
        Array.from(this.keys()).forEach((key) => {
            if (key.length > keys.length && isEqual(key.slice(0, keys.length), keys)) {
                related.set(key, super.get(key) as Notifier<unknown>);
            }
        });

        return related;
    }

    clear() {
        Array.from(this.values()).forEach((notifier) => {
            notifier.clear();
        });

        super.clear();
    }

    notify<T>(keys: Key[], value: T): this;
    notify(keys: Key[], ...args: any[]): this;
    notify<T>(keys: Key[], ...args: any[]) {
        const notifier = this.get<T>(keys);
        if (notifier) {
            notifier.notify(...(args as [any]));
        }
        return this;
    }

    static get(abon: any): NotifierDeep {
        return (abon as any)[KEY];
    }

    static define<T>(abon: T): T {
        Object.defineProperty(abon, KEY, {
            value: new NotifierDeep(),
            configurable: false,
            writable: false,
            enumerable: false,
        });

        return abon;
    }
}

type Key = keyof any;

const KEY = "__notifier";
