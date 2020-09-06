import { Notifier } from "./notifier";

/** Allows for dispatching promises that can be made irrelevant by future dispatches. */
export class PromiseDispatcher<T = any> {
    private __dispatchId?: symbol;
    private __promiseNotifier?: Notifier<any>;

    protected current: T;

    constructor(initial?: T) {
        this.current = initial as T;
        Object.defineProperty(this, "__promiseNotifier", {
            value: new Notifier(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
    }

    async dispatch(promise: Promise<T>, onResolvedUninterrupted?: () => void): Promise<this> {
        const dispatchId = Symbol();
        this.__dispatchId = dispatchId;
        const value = await promise;
        if (this.__dispatchId === dispatchId) {
            this.setCurrent(value);
            (this.__promiseNotifier as Notifier<any>).notify(undefined);
            if (typeof onResolvedUninterrupted === "function") {
                onResolvedUninterrupted();
            }
        }
        return this;
    }

    async dispatchForCurrent(promise: Promise<any>, onResolvedUninterrupted: () => void): Promise<this> {
        let dispatchId: symbol;
        const currentDispatchExists = Boolean(this.__dispatchId);
        if (currentDispatchExists) {
            dispatchId = this.__dispatchId as symbol;
        } else {
            dispatchId = Symbol();
            this.__dispatchId = dispatchId;
        }
        await promise;
        if (this.__dispatchId === dispatchId) {
            if (!currentDispatchExists) {
                (this.__promiseNotifier as Notifier<undefined>).notify(undefined);
            }
            if (typeof onResolvedUninterrupted === "function") {
                onResolvedUninterrupted();
            }
        }
        return this;
    }

    set(value: T) {
        delete this.__dispatchId;
        this.setCurrent(value);
        (this.__promiseNotifier as Notifier<undefined>).notify(undefined);
    }

    get promise(): Promise<T> {
        return new Promise((resolve) => {
            if (!this.__dispatchId) {
                return resolve(this.current);
            }
            const unsubscribe = (this.__promiseNotifier as Notifier<any>).subscribe(() => {
                unsubscribe();
                resolve(this.current);
            });
        });
    }

    protected setCurrent(value: T) {
        this.current = value;
    }
}
