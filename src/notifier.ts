import { ChangeListener, UnsubscribeFn } from "./types";

export class Notifier<T> extends Set<ChangeListener<T>> {
    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        this.add(listener);

        return () => this.unsubscribe(listener);
    }

    unsubscribe(listener: ChangeListener<T>) {
        this.delete(listener);
    }

    notify(value: T): this;
    notify(value: T, ...otherArgs: any[]): this;
    notify(...args: any[]) {
        Array.from(this.values()).forEach((listener) => listener(...(args as [T])));

        return this;
    }
}

const NOTIFIER_KEY_DIVIDER = "/:/";

export class NotifierDeep extends Map<keyof any, Notifier<any>> {
    static notifierKeyDivider = NOTIFIER_KEY_DIVIDER;

    static formatNotifierKey(keys: (keyof any)[]) {
        if (!keys.length) {
            return NotifierDeep.notifierKeyDivider || NOTIFIER_KEY_DIVIDER;
        }

        return keys.join(NotifierDeep.notifierKeyDivider || NOTIFIER_KEY_DIVIDER);
    }

    static parseNotifierKey(notifierKey: keyof any): string[] {
        if (notifierKey === (NotifierDeep.notifierKeyDivider || NOTIFIER_KEY_DIVIDER)) {
            return [];
        }

        return String(notifierKey)
            .split(NotifierDeep.notifierKeyDivider || NOTIFIER_KEY_DIVIDER)
            .filter(Boolean);
    }

    subscribe(keys: (keyof any)[], listener: ChangeListener<any>) {
        const notifierKey = NotifierDeep.formatNotifierKey(keys);

        let notifier: Notifier<any> | undefined = this.get(notifierKey);

        if (!notifier) {
            notifier = new Notifier();
            this.set(notifierKey, notifier);
        }

        const unsubscribe = notifier.subscribe(listener);

        return () => {
            unsubscribe();

            if (notifier && !notifier.size) {
                this.delete(notifierKey);
            }
        };
    }

    notify(keys: (keyof any)[], ...args: any[]): this {
        const notifier = this.get(NotifierDeep.formatNotifierKey(keys));

        if (notifier) {
            notifier.notify(...(args as [any]));
        }

        return this;
    }

    clear() {
        Array.from(this.values()).forEach((notifier) => {
            notifier.clear();
        });

        super.clear();
    }
}
