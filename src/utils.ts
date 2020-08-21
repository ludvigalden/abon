import React from "react";

export { default as useClearedMemo } from "use-cleared-memo";

export function useForceUpdate(): () => void {
    return React.useReducer(() => Object.create(null), undefined)[1] as any;
}

export type Falsey = void | null | false | undefined;
