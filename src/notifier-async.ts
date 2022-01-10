import { AsyncChangeListener, UnsubscribeFn } from "./types";

export class NotifierAsync<T> extends Set<AsyncChangeListener<T>> {
    subscribe(listener: AsyncChangeListener<T>): UnsubscribeFn {
        this.add(listener);

        return () => this.unsubscribe(listener);
    }

    unsubscribe(listener: AsyncChangeListener<T>) {
        this.delete(listener);
    }

    notify(value: T): void | Promise<void>;
    notify(value: T, ...otherArgs: any[]): void | Promise<void>;
    notify(...args: any[]): void | Promise<void> {
        const promises: Promise<void>[] = [];
        Array.from(this.values()).forEach((listener) => {
            const promiseOrVoid = listener(...(args as [T]));
            if (isPromise(promiseOrVoid)) {
                promises.push(promiseOrVoid);
            }
        });
        if (promises.length) {
            return Promise.all(promises).then(() => {});
        }
    }

    static get<T>(abon: any): NotifierAsync<T> {
        return (abon as any)[KEY];
    }

    static define<T>(abon: T): T {
        Object.defineProperty(abon, KEY, {
            value: new NotifierAsync(),
            configurable: false,
            writable: false,
            enumerable: false,
        });

        return abon;
    }
}

const KEY = "__notifier";

function isPromise(v: any): v is Promise<any> {
    return Boolean(v && typeof v["then"] === "function");
}
