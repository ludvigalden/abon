import React from "react";
import isEqual from "lodash.isequal";

import { AbonEvent } from "./abon-event";
import { AbonMap } from "./abon-map";
import { AbonSet } from "./abon-set";
import { Notifier } from "./notifier";
import { ChangeListener, UnsubscribeFn, Subscribeable } from "./types";
import { useClearedMemo, useForceUpdate } from "./utils";
import { AbonDeep } from "./abon-deep";

export class Abon<T> {
    current: T;

    private readonly $notifier: Notifier<T>;

    constructor(initial?: T) {
        this.current = initial as T;

        Object.defineProperty(this, "$notifier", {
            value: new Notifier(),
            configurable: false,
            writable: false,
            enumerable: false,
        });
    }

    set(value: T) {
        if (!isEqual(this.current, value)) {
            this.current = value;
            this.$notifier.notify(value);
        }

        return this;
    }

    subscribe(listener: ChangeListener<T>): UnsubscribeFn {
        return this.$notifier.subscribe(listener);
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

    notify() {
        this.$notifier.notify(this.current);
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

    static composedSubscription(
        listener: () => void,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
    ): UnsubscribeFn {
        const unsubscribeFns = listen(listener);
        return () => Array.from(unsubscribeFns).forEach((unsubscribeFn) => typeof unsubscribeFn === "function" && unsubscribeFn());
    }

    static useComposedSubscription(
        listener: () => void,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        deps: readonly any[] = [],
    ) {
        useClearedMemo(
            () => this.composedSubscription(listener, listen),
            (unsubscribe) => unsubscribe(),
            deps,
        );
    }

    static useComposedValue<T>(
        getValue: () => T,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        deps: readonly any[] = [],
    ): T {
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

    static useComposedValueAsync<T>(
        getValue: () => Promise<T>,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        deps: readonly any[] = [],
    ): T | undefined {
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

    static from<T>(
        getValue: () => T,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        setUnsubscribe: (unsubscribe: UnsubscribeFn) => void,
    ): Abon<T>;
    static from<T>(
        getValue: () => T,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        unsubscribeFns: Set<UnsubscribeFn>,
    ): Abon<T>;
    static from<T>(
        getValue: () => T,
        listen: (listener: () => void) => Iterable<UnsubscribeFn | boolean | undefined | null | void>,
        unsubscribe: Set<UnsubscribeFn> | ((unsubscribe: UnsubscribeFn) => void),
    ): Abon<T> {
        const abon = new Abon(getValue());

        const subscription = Abon.composedSubscription(function() {
            abon.set(getValue());
        }, listen);

        if (unsubscribe instanceof Set) {
            unsubscribe.add(subscription);
        } else {
            unsubscribe(subscription);
        }

        return abon;
    }

    static resolve<T>(listen: (listener: (value?: T) => void) => UnsubscribeFn): Promise<void>;
    static resolve<T>(abon: Abon<T>): Promise<T>;
    static resolve<T extends object>(abon: AbonDeep<T>): Promise<T>;
    static resolve<AM extends AbonMap<any, any>>(map: AM): Promise<AM>;
    static resolve<AS extends AbonSet<any>>(set: AS): Promise<AS>;
    static resolve<S extends Subscribeable<any>>(subscribable: S): Promise<S extends Subscribeable<infer T> ? T : unknown>;
    static resolve(arg: any): Promise<any> {
        let listen: (listener: (value?: any) => void) => UnsubscribeFn;

        if (typeof arg.subscribe === "function") {
            listen = arg.subscribe.bind(arg);
        } else {
            listen = arg;
        }

        let setValue: (value?: any) => void;
        let resolveValue: any = INITIAL_VALUE;

        const unsubscribe = listen(function(value) {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }

            if (setValue) {
                setValue(value);
            } else {
                resolveValue = value;
            }
        });

        return new Promise(function(resolve) {
            if (resolveValue !== INITIAL_VALUE) {
                resolve(resolveValue);
            } else {
                setValue = resolve;
            }
        });
    }

    static Deep = AbonDeep;
    static Event = AbonEvent;
    static Map = AbonMap;
    static Set = AbonSet;
}

const INITIAL_VALUE = Symbol("Initial");
