import isEqual from "lodash/isEqual";

import { composedSubscription } from "./abon-utils";
import { Notifier } from "./notifier";
import { ReadonlyAbon } from "./readonly-abon";
import { ComposedSubscriberFlex, UnsubscribeFn } from "./types";

/** Subscribe to a value composed from multiple subscriptions. */
export class AbonComposed<T> extends ReadonlyAbon<T> {
    current: T;

    private __unsubscriber?: UnsubscribeFn;

    constructor(getter: () => T, subscriber: ComposedSubscriberFlex) {
        super();

        this.current = getter();

        const set = (value: T = getter()) => {
            if (!isEqual(this.current, value)) {
                this.current = value;
                Notifier.get(this).notify(value);
            }
        };

        this.__unsubscriber = composedSubscription(set, subscriber);
    }

    protected unsubscribe() {
        if (typeof this.__unsubscriber === "function") {
            typeof this.__unsubscriber();
            delete this.__unsubscriber;
        }
    }
}

/** Subscribe to a value composed from multiple subscriptions. Also, update the subscriptions and how the value should be composed. */
export class AbonComposedDynamic<T> extends ReadonlyAbon<T> {
    current: T;

    private __unsubscriber?: UnsubscribeFn;

    protected getter: () => T;
    protected subscriber: ComposedSubscriberFlex;

    constructor(getter: () => T, subscriber: ComposedSubscriberFlex) {
        super();

        this.current = getter();

        this.getter = getter;
        this.subscriber = subscriber;
    }

    protected set(value: T = this.getter()) {
        if (!isEqual(this.current, value)) {
            this.current = value;
            Notifier.get(this).notify(value);
        }
    }

    setGetter(getter: () => T) {
        this.getter = getter;
        this.set(getter());
    }

    setSubscriber(subscriber: ComposedSubscriberFlex) {
        this.subscriber = subscriber;
        this.hydrateSubscriber();
    }

    protected hydrateSubscriber() {
        this.unsubscribe();
        this.__unsubscriber = composedSubscription(this.set.bind(this), this.subscriber);
    }

    protected unsubscribe() {
        if (typeof this.__unsubscriber === "function") {
            this.__unsubscriber();
            delete this.__unsubscriber;
        }
    }
}
