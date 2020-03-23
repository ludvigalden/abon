import React from "react";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

export class AbonSet<T> extends Set<T> {
    private readonly $notifier: Notifier<this>;

    constructor(initial?: Iterable<T>) {
        super(initial);

        Object.defineProperty(this, "$notifier", {
            value: new Notifier(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
    }

    add(value: T) {
        if (!this.$notifier) {
            return super.add(value);
        }

        if (!this.has(value)) {
            super.add(value);

            this.notify();
        }

        return this;
    }

    delete(value: T) {
        if (this.has(value)) {
            const deleted = super.delete(value);

            this.notify();

            return deleted;
        }

        return false;
    }

    set(values?: Iterable<T>) {
        let modifiedAny = false;

        const forced = new Set(values);

        Array.from(this.values()).forEach((value) => {
            if (!forced.has(value)) {
                super.delete(value);
                modifiedAny = true;
            }
        });

        Array.from(forced.values()).forEach((value) => {
            if (!super.has(value)) {
                super.add(value);
                modifiedAny = true;
            }
        });

        if (modifiedAny) {
            this.notify();
        }

        return modifiedAny;
    }

    modify(add?: Iterable<T>, remove?: Iterable<T>) {
        let modifiedAny = false;

        if (add) {
            Array.from(add).forEach((value) => {
                if (!this.has(value)) {
                    super.add(value);

                    modifiedAny = true;
                }
            });
        }

        if (remove) {
            Array.from(remove).forEach((value) => {
                if (this.has(value)) {
                    super.delete(value);

                    modifiedAny = true;
                }
            });
        }

        if (modifiedAny) {
            this.notify();
        }

        return modifiedAny;
    }

    subscribe(callback: ChangeListener<this>): UnsubscribeFn {
        return this.$notifier.subscribe(callback);
    }

    clear() {
        super.clear();
        this.$notifier.notify(this);
    }

    use() {
        const listener = useForceUpdate();

        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, listener],
        );

        return this;
    }

    notify() {
        this.$notifier.notify(this);
    }

    static use<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return AbonSet.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return React.useMemo(() => new AbonSet(typeof initial === "function" ? initial() : undefined), deps);
    }
}
