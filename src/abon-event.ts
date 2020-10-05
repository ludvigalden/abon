import React from "react";

import { Notifier } from "./notifier";
import { ReadonlyAbonEvent } from "./readonly-abon-event";

/** Notify and subscribe to events and payloads. */
export class AbonEvent<E = undefined, P = undefined> extends ReadonlyAbonEvent<E, P> {
    notify(event: E): void;
    notify(event: E, payload: P): void;
    notify(event: E, payloads: P[]): void;
    notify(event: E, payload?: P | P[]) {
        if (Array.isArray(payload)) {
            payload.forEach((payloadItem) => {
                Notifier.get(this).notify(event, payloadItem);
            });
        } else {
            Notifier.get(this).notify(event, payload);
        }
    }

    static use<E = undefined, P = undefined>(deps: readonly any[] = []): AbonEvent<E, P> {
        return React.useMemo(() => new AbonEvent(), deps);
    }
}
