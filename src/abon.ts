import React from "react";
import isEqual from "lodash/isEqual";
import useClearedMemo from "use-cleared-memo";

import { AbonDeep } from "./abon-deep";
import { AbonMap } from "./abon-map";
import { AbonSet } from "./abon-set";
import { Notifier } from "./notifier";
import { UnsubscribeFn, Subscribeable, ComposedSubscriberFlexResult, ComposedSubscriberFlex } from "./types";
import { useForceUpdate, validateListener } from "./utils";
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

    static mergeUnsubscriber(result: ComposedSubscriberFlexResult): UnsubscribeFn {
        if (typeof result === "function") {
            return result;
        } else if (Array.isArray(result)) {
            return () => Array.from(result).forEach((unsubscribeFn) => typeof unsubscribeFn === "function" && unsubscribeFn());
        } else {
            return () => {};
        }
    }

    static composedSubscription(listener: () => void, listen: ComposedSubscriberFlex): UnsubscribeFn {
        validateListener(listener);
        return this.mergeUnsubscriber(listen(listener));
    }

    static composedHandler(handler: () => void, listen: ComposedSubscriberFlex): UnsubscribeFn {
        validateListener(handler);
        handler();
        return this.composedSubscription(handler, listen);
    }

    static useComposedSubscription(listener: () => void, listen: ComposedSubscriberFlex, deps: readonly any[] = []) {
        useClearedMemo(
            () => this.composedSubscription(listener, listen),
            (unsubscribe) => unsubscribe(),
            deps,
        );
    }

    static useComposedValue<T>(getValue: () => T, listen: ComposedSubscriberFlex, deps: readonly any[] = []): T {
        const listener = useForceUpdate();
        const value = React.useRef<T>();

        useClearedMemo(
            () => {
                let nextValue = getValue();

                if (!isEqual(value.current, nextValue)) {
                    value.current = nextValue;
                    listener();
                }

                return Abon.composedSubscription(() => {
                    nextValue = getValue();

                    if (!isEqual(value, nextValue)) {
                        value.current = nextValue;
                        listener();
                    }
                }, listen);
            },
            (unsubscribe) => unsubscribe(),
            deps,
        );

        return value.current as T;
    }

    static useComposedValueAsync<T>(getValue: () => Promise<T>, listen: ComposedSubscriberFlex, deps: readonly any[] = []): T | undefined {
        const listener = useForceUpdate();
        const value = React.useRef<T>();
        const getting = React.useRef<symbol>();

        useClearedMemo(
            () => {
                const gettingMemo = (getting.current = Symbol());

                getValue().then((nextValue) => {
                    if (getting.current === gettingMemo && !isEqual(value, nextValue)) {
                        value.current = nextValue;
                        listener();
                    }
                });

                return Abon.composedSubscription(() => {
                    const gettingSubscription = (getting.current = Symbol());

                    getValue().then((nextValue) => {
                        if (getting.current === gettingSubscription && !isEqual(value, nextValue)) {
                            value.current = nextValue;
                            listener();
                        }
                    });
                }, listen);
            },
            (unsubscribe) => unsubscribe(),
            deps,
        );

        return value.current;
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

        const subscription = Abon.composedSubscription(function() {
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

    static resolve<T>(listen: (listener: (value?: T) => void) => UnsubscribeFn): PromiseLike<void>;
    static resolve<T>(abon: ReadonlyAbon<T>): PromiseLike<T>;
    static resolve<T extends object>(abon: AbonDeep<T>): PromiseLike<T>;
    static resolve<AM extends AbonMap<any, any>>(map: AM): PromiseLike<AM>;
    static resolve<AS extends AbonSet<any>>(set: AS): PromiseLike<AS>;
    static resolve<S extends Subscribeable<any>>(subscribable: S): PromiseLike<S extends Subscribeable<infer T> ? T : unknown>;
    static resolve(arg: any): PromiseLike<any> {
        let listen: (listener: (value?: any) => void) => UnsubscribeFn;

        if (typeof arg.subscribe === "function") {
            listen = arg.subscribe.bind(arg);
        } else {
            listen = arg;
        }

        let setValue: (value?: any) => any;
        let resolved: any = INITIAL_VALUE;

        const unsubscribe = listen(function(value) {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }

            resolved = value;

            if (setValue) {
                setValue(value);
            }
        });

        return {
            then: (onfulfilled, onrejected) => {
                let fulfilled: any = INITIAL_VALUE;

                if (onfulfilled) {
                    if (resolved !== INITIAL_VALUE) {
                        fulfilled = onfulfilled(resolved);
                    } else {
                        setValue = (value) => onfulfilled(value);
                    }
                }

                let promise = new Promise<any>((resolve) => {
                    if (fulfilled !== INITIAL_VALUE) {
                        resolve(fulfilled);
                    } else if (resolved !== INITIAL_VALUE) {
                        if (onfulfilled) {
                            resolve(onfulfilled(resolved));
                        } else {
                            resolve(resolved);
                        }
                    } else {
                        setValue = (value) => {
                            if (onfulfilled) {
                                resolve(onfulfilled(value));
                            } else {
                                resolve(value);
                            }
                        };
                    }
                });

                if (onrejected) {
                    promise = promise.catch(onrejected);
                }

                return promise;
            },
        };
    }
}

const INITIAL_VALUE = Symbol("INITIAL");
