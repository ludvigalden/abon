import React from "react";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";

export class AbonSet<T> extends Set<T> {
    constructor(initial?: Iterable<T>) {
        super(initial);

        Notifier.define(this);
    }

    add(value: T): this;
    /** `Set.add` */
    add(value: T, silent?: true): this;
    add(value: T, silent?: true) {
        if (!Notifier.get(this) || silent) {
            return super.add(value);
        }

        if (!this.has(value)) {
            super.add(value);

            this.notify();
        }

        return this;
    }

    delete(value: T): boolean;
    /** `Set.delete` */
    delete(value: T, silent?: true): boolean;
    delete(value: T, silent?: true) {
        if (silent) {
            return super.delete(value);
        } else if (this.has(value)) {
            const deleted = super.delete(value);

            this.notify();

            return deleted;
        } else {
            return false;
        }
    }

    /** Ensure that the values of the set has equal content to the passed iterable and notifies if there's a diff. */
    set(values?: Iterable<T> | null | false): boolean;
    /** Ensure that the values of the set has equal content to the passed iterable without notifying. */
    set(values?: Iterable<T> | null | false, silent?: true): boolean;
    set(values?: Iterable<T> | null | false, silent?: true) {
        let modifiedAny = false;

        const forced = new Set(values || undefined);

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

        if (modifiedAny && !silent) {
            this.notify();
        }

        return modifiedAny;
    }

    /** Use iterables to add or remove values and notify subscribers if there's a diff. */
    modify(add?: Iterable<T> | null | false, remove?: Iterable<T> | null | false): boolean;
    /** Use iterables to add or remove values without notifying subscribers. */
    modify(add?: Iterable<T> | null | false, remove?: Iterable<T> | null | false, silent?: true): boolean;
    modify(add?: Iterable<T> | null | false, remove?: Iterable<T> | null | false, silent?: true) {
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

        if (modifiedAny && !silent) {
            this.notify();
        }

        return modifiedAny;
    }

    subscribe(callback: ChangeListener<this>): UnsubscribeFn {
        return Notifier.get<this>(this).subscribe(callback);
    }

    clear(): void;
    /** `Set.clear` */
    clear(silent?: true): void;
    clear(silent?: true) {
        super.clear();

        if (!silent) {
            Notifier.get<this>(this).notify(this);
        }
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
        Notifier.get<this>(this).notify(this);
    }

    static use<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return AbonSet.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return React.useMemo(() => new AbonSet(typeof initial === "function" ? initial() : undefined), deps);
    }
}
