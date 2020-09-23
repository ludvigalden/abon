import React from "react";
import isEqual from "lodash/isEqual";
import useClearedMemo from "use-cleared-memo";

import { Notifier } from "./notifier";
import { UnsubscribeFn } from "./types";
import { ReadonlyAbon } from "./readonly-abon";

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
