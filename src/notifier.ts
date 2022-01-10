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

    static get<T>(abon: any): Notifier<T> {
        return (abon as any)[KEY];
    }

    static define<T>(abon: T): T {
        Object.defineProperty(abon, KEY, {
            value: new Notifier(),
            configurable: false,
            writable: false,
            enumerable: false,
        });

        return abon;
    }
}
const KEY = "__notifier";
