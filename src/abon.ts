import isEqual from "lodash/isEqual";
import React from "react";
import { useClearedMemo } from "use-cleared-memo";

import { composedSubscription } from "./abon-utils";
import { Notifier } from "./notifier";
import { ReadonlyAbon } from "./readonly-abon";
import { ComposedSubscriberFlex, UnsubscribeFn } from "./types";

/** Subscribe to, retrieve, and update a value. */
export class Abon<T> extends ReadonlyAbon<T> {
    current: T;

    constructor(initial?: T) {
        super();

        this.current = initial as T;
    }

    set(value: T) {
        if (!isEqual(this.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }

        return this;
    }

    notify() {
        Notifier.get(this).notify(this.current);
    }

    static use<T>(initial?: () => T, deps: readonly any[] = []): Abon<T> {
        return Abon.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => T, deps: readonly any[] = []): Abon<T> {
        return React.useMemo(() => new Abon((typeof initial === "function" ? initial() : undefined) as T), deps);
    }

    /** Creates an `Abon` based on a value that should be updated given a selection of subscriptions. */
    static from<T>(
        getValue: () => T,
        listen: ComposedSubscriberFlex,
        setUnsubscribe?: (unsubscribe: UnsubscribeFn) => void,
    ): ReadonlyAbon<T>;
    static from<T>(getValue: () => T, listen: ComposedSubscriberFlex, unsubscribeFns?: Set<Function>): ReadonlyAbon<T>;
    static from<T>(getValue: () => T, listen: ComposedSubscriberFlex, unsubscribeFns?: Set<Function>): ReadonlyAbon<T>;
    static from<T>(
        getValue: () => T,
        listen: ComposedSubscriberFlex,
        unsubscribe?: Set<Function> | ((unsubscribe: UnsubscribeFn) => void),
    ): ReadonlyAbon<T> {
        const abon = new Abon(getValue());

        const subscription = composedSubscription(function () {
            abon.set(getValue());
        }, listen);

        if (unsubscribe) {
            if (unsubscribe instanceof Set) {
                unsubscribe.add(subscription);
            } else {
                unsubscribe(subscription);
            }
        }

        return abon;
    }

    static useFrom<T>(listen: (listener: (value: T) => void) => UnsubscribeFn, initial?: () => T, deps: readonly any[] = []): Abon<T> {
        const abon = Abon.use(initial);

        useClearedMemo(
            () => listen(abon.set.bind(abon)),
            (unsubscribe) => unsubscribe(),
            [this, ...deps],
        );

        return abon;
    }
}
