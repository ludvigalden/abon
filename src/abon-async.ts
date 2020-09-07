import React from "react";
import isEqual from "lodash/isEqual";
import useClearedMemo from "use-cleared-memo";

import { Abon } from "./abon";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, ValueHandler } from "./types";
import { useForceUpdate, validateListener } from "./utils";

/** Subscribe to, retrieve, and asynchronously update a value, where an action to set a value can be interrupted.
 * `AbonAsync` is not intended to be used by itself, but rather to be extended and implementing the `set` method. */
export class AbonAsync<T> implements Omit<Abon<T>, "set" | "use"> {
    private __dispatchId?: symbol;
    private __previousDispatchId?: symbol;
    private __promiseNotifier?: Notifier<any>;

    current: T;

    constructor(initial?: T) {
        this.current = initial as T;
        Notifier.define(this);
        Object.defineProperty(this, "__promiseNotifier", {
            value: new Notifier(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
    }

    async set(promise: Promise<T>, onResolvedUninterrupted?: () => void): Promise<this>;
    async set(value: T): Promise<this>;
    async set(valueOrPromise: T | Promise<T>, onResolvedUninterrupted?: () => void): Promise<this>;
    async set(valueOrPromise: T | Promise<T>, onResolvedUninterrupted?: () => void): Promise<this> {
        if (typeof valueOrPromise === "object" && (valueOrPromise as Promise<T>)["then"]) {
            const dispatchId = Symbol();
            this.__dispatchId = dispatchId;
            return (valueOrPromise as Promise<T>).then((value) => {
                if (this.__dispatchId === dispatchId) {
                    delete this.__dispatchId;
                    this.__previousDispatchId = dispatchId;
                    if (!isEqual(this.current, value)) {
                        this.current = value;
                        Notifier.get(this).notify(value);
                    }
                    (this.__promiseNotifier as Notifier<any>).notify(undefined);
                    if (typeof onResolvedUninterrupted === "function") {
                        onResolvedUninterrupted();
                    }
                }
                return this;
            });
        }
        delete this.__dispatchId;
        const value: T = valueOrPromise as T;
        if (!isEqual(this.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }
        (this.__promiseNotifier as Notifier<undefined>).notify(undefined);
        return this;
    }

    async dispatch(promise: Promise<any>, onResolvedUninterrupted: () => void): Promise<this> {
        let dispatchId: symbol;
        const currentDispatchExists = Boolean(this.__dispatchId);
        if (currentDispatchExists) {
            dispatchId = this.__dispatchId as symbol;
        } else {
            dispatchId = Symbol();
            this.__dispatchId = dispatchId;
        }
        await promise;
        if (this.__dispatchId === dispatchId || (!this.__dispatchId && this.__previousDispatchId === dispatchId)) {
            if (!currentDispatchExists) {
                delete this.__dispatchId;
                this.__previousDispatchId = dispatchId;
                (this.__promiseNotifier as Notifier<undefined>).notify(undefined);
            }
            if (typeof onResolvedUninterrupted === "function") {
                onResolvedUninterrupted();
            }
        }
        return this;
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

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        validateListener(listener);
        return Notifier.get<T>(this).subscribe(listener);
    }

    handle(handler: ValueHandler<T>): UnsubscribeFn {
        validateListener(handler);
        handler(this.current);
        return this.subscribe(handler);
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

    notify() {
        Notifier.get(this).notify(this.current);
    }

    static use<T>(initial?: () => T, deps: readonly any[] = []) {
        return this.useRef(initial, deps).use();
    }

    static useRef<T>(initial?: () => T, deps: readonly any[] = []): AbonAsync<T> {
        return React.useMemo(() => new AbonAsync((typeof initial === "function" ? initial() : undefined) as T), deps);
    }
}
