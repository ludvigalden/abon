import React from "react";

export function useUnsafeForceUpdate(): () => void {
    return React.useReducer(() => Object.create(null), undefined)[1] as any;
}

export function useMountedForceUpdate(): () => void {
    const unsafeForceUpdate = useUnsafeForceUpdate();
    const lifecycle = React.useRef({ queuedUpdate: false, mounted: false, unmounted: false });
    React.useEffect(() => {
        lifecycle.current.mounted = true;
        if (lifecycle.current.queuedUpdate) {
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

export type Falsey = void | null | false | undefined;

export function validateListener(listener: any) {
    if (typeof listener !== "function") {
        throw new Error('The listener must be a function, got "' + String(listener) + '".');
    }
}
