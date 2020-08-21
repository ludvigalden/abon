import isEqual from "lodash/isEqual";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn } from "./types";
import { useForceUpdate, useClearedMemo } from "./utils";
import { AbonSet } from "./abon-set";
import { ReadonlyAbon } from "./readonly-abon";

/** Inherits a value from children if the current value is undefined. */
export class AbonInheritedUp<T> implements Abon<T> {
    protected readonly children: AbonSet<Abon<T>>;
    protected readonly value: Abon<T>;
    protected readonly childValue: ReadonlyAbon<T>;

    constructor(initial?: T) {
        this.value = new Abon(initial);
        this.children = new AbonSet();
        this.childValue = new Abon();

        const setChildValue = () => {
            const nonUndefinedValue = Array.from(this.children).find((value) => value.current !== undefined);
            (this.childValue as Abon<T>).set((nonUndefinedValue ? nonUndefinedValue.current : undefined) as T);
        };

        let childrenSubscription: UnsubscribeFn;
        this.children.subscribe(() => {
            if (typeof childrenSubscription === "function") {
                childrenSubscription();
            }
            setChildValue();
            childrenSubscription = Abon.composedSubscription(setChildValue, (listener) =>
                Array.from(this.children).map((child) => child.subscribe(listener)),
            );
        });
        setChildValue();
    }

    set(value: T) {
        if (!isEqual(this.value.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }

        return this;
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        return Abon.composedSubscription(
            () => listener(this.current),
            (composedListener) => [
                Notifier.get<T>(this.value).subscribe(composedListener),
                Notifier.get<T>(this.childValue).subscribe(composedListener),
            ],
        );
    }

    nest<AT extends Abon<T>>(abon: AT): AT;
    nest(abon: Abon<T>): Abon<T>;
    nest(): Abon<T>;
    nest(abon: Abon<T> = new Abon()) {
        this.children.add(abon);
        return abon;
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

    notify() {
        Notifier.get(this).notify(this.current);
    }

    get current() {
        const value = this.value.current;
        if (value === undefined && this.childValue.current) {
            return this.childValue.current;
        }
        return value;
    }

    set current(value: T) {
        this.value.current = value;
    }
}
