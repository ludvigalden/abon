import React from "react";

const INITIAL_VALUE: never = Symbol("initial") as never;

/** Allows `get` and `clear` for a value based on the identiety of the passed `deps`, as well as being cleared on unmount. */
export function useClearedMemo<T>(get: () => T, clear: (previousValue: T) => void, deps: readonly any[] = []) {
    const valueRef = React.useRef<T>(INITIAL_VALUE);

    React.useMemo(() => {
        if (valueRef.current !== INITIAL_VALUE) {
            clear(valueRef.current);
        }

        valueRef.current = get();
    }, deps);

    /** Call the `clear` fn on unmount. */
    React.useEffect(
        () => () => {
            clear(valueRef.current);
            valueRef.current = INITIAL_VALUE;
        },
        [],
    );

    return valueRef.current;
}

export function useForceUpdate(): () => void {
    return React.useReducer(() => Object.create(null), undefined)[1] as any;
}
