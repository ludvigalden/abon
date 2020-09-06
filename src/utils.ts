import React from "react";

export function useForceUpdate(): () => void {
    return React.useReducer(() => Object.create(null), undefined)[1] as any;
}

export type Falsey = void | null | false | undefined;

export function validateListener(listener: any) {
    if (typeof listener !== "function") {
        throw new Error('The listener must be a function, got "' + String(listener) + '".');
    }
}
