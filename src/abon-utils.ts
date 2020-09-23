import React from "react";
import isEqual from "lodash/isEqual";
import useClearedMemo from "use-cleared-memo";

import { ComposedSubscriberFlexResult, UnsubscribeFn, ComposedSubscriberFlex, Subscribeable } from "./types";
import { validateListener, useForceUpdate } from "./utils";
import { ReadonlyAbon } from "./readonly-abon";
import { AbonMap } from "./abon-map";
import { AbonSet } from "./abon-set";
import { AbonDeep } from "./abon-deep";

export function composedSubscription(listener: () => void, listen: ComposedSubscriberFlex): UnsubscribeFn {
    validateListener(listener);
    return mergeUnsubscriber(listen(listener));
}

export function hydratedSubscription<LT>(
    listener: LT,
    listen: (listener: LT) => UnsubscribeFn,
    listenHydrate: ComposedSubscriberFlex,
): UnsubscribeFn {
    validateListener(listener);
    let unsubscribe: UnsubscribeFn | undefined;
    function hydrateSubscription() {
        if (typeof unsubscribe === "function") {
            unsubscribe();
        }
        unsubscribe = listen(listener);
    }
    let unsubscribeHydrate: UnsubscribeFn | undefined = composedHandler(hydrateSubscription, listenHydrate);
    return function unsubscribeHydratedSubscription() {
        if (typeof unsubscribeHydrate === "function") {
            unsubscribeHydrate();
            unsubscribeHydrate = undefined;
        }
        if (typeof unsubscribe === "function") {
            unsubscribe();
            unsubscribe = undefined;
        }
    };
}

export function hydratedComposedSubscription(
    listener: () => void,
    listen: ComposedSubscriberFlex,
    listenHydrate: ComposedSubscriberFlex,
): UnsubscribeFn {
    validateListener(listener);
    let unsubscribe: UnsubscribeFn | undefined;
    function hydrateSubscription() {
        if (typeof unsubscribe === "function") {
            unsubscribe();
        }
        unsubscribe = composedSubscription(listener, listen);
    }
    let unsubscribeHydrate: UnsubscribeFn | undefined = composedHandler(hydrateSubscription, listenHydrate);
    return function unsubscribeHydratedSubscription() {
        if (typeof unsubscribeHydrate === "function") {
            unsubscribeHydrate();
            unsubscribeHydrate = undefined;
        }
        if (typeof unsubscribe === "function") {
            unsubscribe();
            unsubscribe = undefined;
        }
    };
}

export function composedHandler(handler: () => void, listen: ComposedSubscriberFlex): UnsubscribeFn {
    validateListener(handler);
    handler();
    return composedSubscription(handler, listen);
}

export function hydratedComposedHandler(
    handler: () => void,
    listen: ComposedSubscriberFlex,
    listenHydrate: ComposedSubscriberFlex,
): UnsubscribeFn {
    validateListener(handler);
    handler();
    return hydratedComposedSubscription(handler, listen, listenHydrate);
}

export function useComposedSubscription(listener: () => void, listen: ComposedSubscriberFlex, deps: readonly any[] = []) {
    useClearedMemo(
        () => composedSubscription(listener, listen),
        (unsubscribe) => unsubscribe(),
        deps,
    );
}

export function useHydratedSubscription<LT>(
    listener: LT,
    listen: (listener: LT) => UnsubscribeFn,
    listenHydrate: ComposedSubscriberFlex,
    deps: readonly any[] = [],
) {
    useClearedMemo(
        () => hydratedSubscription(listener, listen, listenHydrate),
        (unsubscribe) => unsubscribe(),
        deps,
    );
}

export function useHydratedComposedSubscription(
    listener: () => void,
    listen: ComposedSubscriberFlex,
    listenHydrate: ComposedSubscriberFlex,
    deps: readonly any[] = [],
) {
    useClearedMemo(
        () => hydratedComposedSubscription(listener, listen, listenHydrate),
        (unsubscribe) => unsubscribe(),
        deps,
    );
}

export function useComposedHandler(handler: () => void, listen: ComposedSubscriberFlex, deps: readonly any[] = []) {
    useClearedMemo(
        () => composedHandler(handler, listen),
        (unsubscribe) => unsubscribe(),
        deps,
    );
}

export function useHydratedComposedHandler(
    handler: () => void,
    listen: ComposedSubscriberFlex,
    listenHydrate: ComposedSubscriberFlex,
    deps: readonly any[] = [],
) {
    useClearedMemo(
        () => hydratedComposedHandler(handler, listen, listenHydrate),
        (unsubscribe) => unsubscribe(),
        deps,
    );
}

export function useComposedValue<T>(getValue: () => T, listen: ComposedSubscriberFlex, deps: readonly any[] = []): T {
    const listener = useForceUpdate();
    const value = React.useRef<T>();

    useClearedMemo(
        () => {
            let nextValue = getValue();

            if (!isEqual(value.current, nextValue)) {
                value.current = nextValue;
                listener();
            }

            return composedSubscription(() => {
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

export function useComposedValueAsync<T>(
    getValue: () => Promise<T>,
    listen: ComposedSubscriberFlex,
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

            return composedSubscription(() => {
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

export function resolve<T>(listen: (listener: (value?: T) => void) => UnsubscribeFn): PromiseLike<void>;
export function resolve<T>(abon: ReadonlyAbon<T>): PromiseLike<T>;
export function resolve<T extends object>(abon: AbonDeep<T>): PromiseLike<T>;
export function resolve<AM extends AbonMap<any, any>>(map: AM): PromiseLike<AM>;
export function resolve<AS extends AbonSet<any>>(set: AS): PromiseLike<AS>;
export function resolve<S extends Subscribeable<any>>(subscribable: S): PromiseLike<S extends Subscribeable<infer T> ? T : unknown>;
export function resolve(arg: any): PromiseLike<any> {
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

const INITIAL_VALUE = Symbol("INITIAL");

function mergeUnsubscriber(result: ComposedSubscriberFlexResult): UnsubscribeFn {
    if (typeof result === "function") {
        return result;
    } else if (Array.isArray(result)) {
        return () => Array.from(result).forEach((unsubscribeFn) => typeof unsubscribeFn === "function" && unsubscribeFn());
    } else {
        return () => {};
    }
}
