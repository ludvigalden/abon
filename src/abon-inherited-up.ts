import isEqual from "lodash/isEqual";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ReadonlyAbonInheritedUp } from "./readonly-abon-inherited-up";

/** Inherits a value from children if the current value is undefined. */
export class AbonInheritedUp<T> extends ReadonlyAbonInheritedUp<T> implements Abon<T> {
    set(value: T | undefined) {
        if (!isEqual(this.value.current, value)) {
            this.current = value as T;
            Notifier.get(this).notify(value);
        }

        return this;
    }

    notify() {
        Notifier.get(this).notify(this.current);
    }

    set current(value: T) {
        this.value.current = value;
    }

    get current() {
        const value = this.value.current;
        if (value === undefined && this.childValue.current) {
            return this.childValue.current;
        }
        return value;
    }
}
