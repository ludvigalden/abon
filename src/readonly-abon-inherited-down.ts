import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, ValueHandler, UnsubscribeFn } from "./types";
import { useForceUpdate, useClearedMemo, validateListener } from "./utils";
import { ReadonlyAbon } from "./readonly-abon";
import { AbonInheritedDown } from "./abon-inherited-down";

/** Inherits a value from parents if the current value is undefined. */
export class ReadonlyAbonInheritedDown<T> implements ReadonlyAbon<T> {
    protected readonly parent?: Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current">;
    protected readonly value: Abon<T>;

    constructor(initial?: T, parent?: Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current">) {
        this.value = new Abon(initial);
        this.parent = parent;
        Notifier.define(this);
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        validateListener(listener);
        return Abon.composedSubscription(
            () => listener(this.current),
            (composedListener) => [
                Notifier.get<T>(this.value).subscribe(composedListener),
                this.parent ? Notifier.get<T>(this.parent).subscribe(composedListener) : undefined,
            ],
        );
    }

    handle(handler: ValueHandler<T>): UnsubscribeFn {
        validateListener(handler);
        handler(this.current);
        return this.subscribe(handler);
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

    useSubscription(listener: ChangeListener<T>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.subscribe(listener),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    useHandler(handler: ValueHandler<T>, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.handle(handler),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );
    }

    nest() {
        return new AbonInheritedDown<T>(undefined, this);
    }

    get current(): T {
        const value = this.value.current;
        if (value === undefined && this.parent) {
            return this.parent.current as T;
        }
        return value;
    }
}
