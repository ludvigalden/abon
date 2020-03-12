import React from "react";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo } from "./utils";

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

    modify(add?: Iterable<T>, remove?: Iterable<T>) {
        let deletedAny = false;
        let addedAny = false;

        if (add) {
            Array.from(add).forEach((value) => {
                if (!this.has(value)) {
                    super.add(value);

                    addedAny = true;
                }
            });
        }

        if (remove) {
            Array.from(remove).forEach((value) => {
                if (this.has(value)) {
                    super.delete(value);

                    deletedAny = true;
                }
            });
        }

        if (deletedAny || addedAny) {
            this.notify();

            return true;
        } else {
            return false;
        }
    }

    subscribe(callback: ChangeListener<this>): UnsubscribeFn {
        return this.$notifier.subscribe(callback);
    }

    clear() {
        super.clear();
        this.$notifier.notify(this);
    }

    use() {
        const forceUpdate = React.useReducer(() => Object.create(null), undefined)[1];

        useClearedMemo(
            () => this.subscribe(forceUpdate),
            (unsubscribe) => unsubscribe(),
            [this, forceUpdate],
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
