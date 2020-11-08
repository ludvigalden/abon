import React from "react";
import { useClearedMemo } from "use-cleared-memo";

import { UnsubscribeFn } from "./types";

export function useUnsafeForceUpdate(): () => void {
    return React.useReducer(() => Object.create(null), undefined)[1] as any;
}

/**
 * A safe form of force updating a component. The basic quality is to not perform any updates when the component
 * is not unmounted. In addition, it also allows for queueing a update for when the component *has* been mounted,
 * which is simply done by calling the function before the component has been mounted.
 */
export function useMountedForceUpdate(): () => void {
    const unsafeForceUpdate = useUnsafeForceUpdate();
    const lifecycle = React.useRef({ queuedUpdate: false, mounted: false, unmounted: false });
    React.useEffect(() => {
        lifecycle.current.mounted = true;
        if (lifecycle.current.queuedUpdate) {
            lifecycle.current.queuedUpdate = false;
            unsafeForceUpdate();
        }
        return () => {
            lifecycle.current.unmounted = true;
        };
    }, []);
    return function mountedForceUpdate() {
        if (lifecycle.current.mounted) {
            if (!lifecycle.current.unmounted) {
                unsafeForceUpdate();
            }
        } else {
            lifecycle.current.queuedUpdate = true;
        }
    };
}

/**
 * Similar to constructing a subscription to a value using `useClearedMemo`, but this also allows for making
 * sure that the most recently notified value is equal to the current value when constructing the subscription.
 * This solves the problem that `useClearedMemo` may call the getter function inside an effect.
 */
export function useClearedValueSubscription<T>(
    initialValue: T,
    getValue: () => T,
    onValueDiff: () => void,
    valueSubscriber: (listener: (value: T) => void) => UnsubscribeFn,
    deps: readonly any[] = [],
) {
    const value = React.useRef<T>(initialValue);

    useClearedMemo(
        () => {
            const currentValue = getValue();
            if (value.current !== currentValue) {
                value.current = currentValue;
                onValueDiff();
            }
            const subscribed = valueSubscriber((currentValue: T) => {
                value.current = currentValue;
                onValueDiff();
            });
            return subscribed;
        },
        (unsubscribe) => unsubscribe(),
        deps,
    );

    return value;
}

export type Falsey = void | null | false | undefined;

export function validateListener(listener: any) {
    if (typeof listener !== "function") {
        throw new Error('The listener must be a function, got "' + String(listener) + '".');
    }
}
