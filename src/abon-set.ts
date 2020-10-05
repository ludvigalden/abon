import React from "react";
import { useClearedMemo } from "use-cleared-memo";

import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, ValueHandler } from "./types";
import { Falsey, useMountedForceUpdate, validateListener } from "./utils";

/** Subscribe to and set the values of a `Set`. */
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
    modify(add?: Iterable<T> | Falsey, remove?: Iterable<T> | Falsey): boolean;
    /** Use iterables to add or remove values without notifying subscribers. */
    modify(add?: Iterable<T> | Falsey, remove?: Iterable<T> | Falsey, silent?: true): boolean;
    modify(add?: Iterable<T> | Falsey, remove?: Iterable<T> | Falsey, silent?: true) {
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

    handle(handler: ValueHandler<this>): UnsubscribeFn {
        validateListener(handler);
        handler(this);
        return this.subscribe(handler);
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
        const listener = useMountedForceUpdate();

        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, listener],
        );

        return this;
    }

    useSubscription(listener: ChangeListener<this>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    useHandler(handler: ValueHandler<this>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.handle(handler),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    notify() {
        Notifier.get<this>(this).notify(this);
    }

    get readonly(): ReadonlyAbonSet<T> {
        return this;
    }

    static use<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return AbonSet.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => Iterable<T>, deps: readonly any[] = []): AbonSet<T> {
        return React.useMemo(() => new AbonSet(typeof initial === "function" ? initial() : undefined), deps);
    }
}

interface ReadonlyAbonSet<T> extends Omit<AbonSet<T>, "notify" | "clear" | "modify" | "set" | "delete" | "add" | "readonly" | "use"> {
    use(): ReadonlyAbonSet<T>;
}
