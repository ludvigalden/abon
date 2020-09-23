import useClearedMemo from "use-cleared-memo";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, ValueHandler } from "./types";
import { useForceUpdate, validateListener } from "./utils";
import { AbonSet } from "./abon-set";
import { ReadonlyAbon } from "./readonly-abon";
import { composedSubscription } from "./abon-utils";

/** Inherits a value from children if the current value is undefined. */
export class ReadonlyAbonInheritedUp<T> implements ReadonlyAbon<T> {
    protected readonly children: AbonSet<Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current">>;
    protected readonly value: Abon<T>;
    protected readonly childValue: ReadonlyAbon<T>;

    constructor() {
        Notifier.define(this);

        this.value = new Abon();
        this.children = new AbonSet();
        this.childValue = new Abon();

        const setChildValue = () => {
            const nonUndefinedChild = Array.from(this.children).find((value) => value.current !== undefined);
            (this.childValue as Abon<T>).set((nonUndefinedChild ? nonUndefinedChild.current : undefined) as T);
        };

        let childrenSubscription: UnsubscribeFn;
        this.children.subscribe(() => {
            if (typeof childrenSubscription === "function") {
                childrenSubscription();
            }
            setChildValue();
            childrenSubscription = composedSubscription(setChildValue, (listener) =>
                Array.from(this.children).map((child) => child.subscribe(listener)),
            );
        });
        setChildValue();
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        validateListener(listener);
        return composedSubscription(
            () => listener(this.current),
            (composedListener) => [
                Notifier.get<T>(this.value).subscribe(composedListener),
                Notifier.get<T>(this.childValue).subscribe(composedListener),
            ],
        );
    }

    handle(handler: ValueHandler<T>): UnsubscribeFn {
        validateListener(handler);
        handler(this.current);
        return this.subscribe(handler);
    }

    addChild<AT extends Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current">>(abon: AT): AT;
    addChild(abon: Abon<T>): Abon<T>;
    addChild(): Abon<T | undefined>;
    addChild(abon: Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current"> = new Abon()): any {
        this.children.add(abon);
        return abon;
    }

    removeChild(child: Pick<ReadonlyAbon<T | undefined>, "subscribe" | "current">) {
        this.children.delete(child);
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

    get current() {
        const value = this.value.current;
        if (value === undefined && this.childValue.current) {
            return this.childValue.current;
        }
        return value;
    }
}
