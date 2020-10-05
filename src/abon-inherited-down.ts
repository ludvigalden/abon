import isEqual from "lodash/isEqual";
import React from "react";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ReadonlyAbonInheritedDown } from "./readonly-abon-inherited-down";

/** Inherits a value from parents if the current value is undefined. */
export class AbonInheritedDown<T> extends ReadonlyAbonInheritedDown<T> implements Abon<T> {
    set(value: T) {
        if (!isEqual(this.value.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }

        return this;
    }

    nest() {
        return new AbonInheritedDown<T>(undefined, this);
    }

    notify() {
        Notifier.get(this).notify(this.current);
    }

    set current(value: T) {
        this.value.current = value;
    }

    get current(): T {
        const value = this.value.current;
        if (value === undefined && this.parent) {
            return this.parent.current as T;
        }
        return value;
    }

    static use<T extends object>(initial?: () => T, deps: readonly any[] = []) {
        return this.useRef(initial, deps).use();
    }

    static useRef<T extends object>(initial?: () => T, deps: readonly any[] = []): AbonInheritedDown<T> {
        return React.useMemo(() => new AbonInheritedDown((typeof initial === "function" ? initial() : undefined) as T), deps);
    }
}
