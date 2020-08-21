export interface UnsubscribeFn {
    (): void;
}

export interface Listener {
    (): void;
}

export interface ChangeListener<T> {
    (current: T): void;
}

export interface EventListener<E, P> {
    (event: E, payload: P): void;
}

export interface EventPayloadListener<P> {
    (payload: P): void;
}

export interface ItemsChangeListener<T extends object, I extends keyof T> {
    (current: ItemRecord<T, I>, items: T[], ids: T[I][]): any;
}

export type ItemRecordKey<T extends object, I extends keyof T> = T[I] & (string | number | symbol);

export type ItemRecord<T extends object, I extends keyof T> = Record<ItemRecordKey<T, I>, T>;

export interface Subscribeable<T> {
    subscribe(listener: ChangeListener<T>): UnsubscribeFn;
}

export type SubscriberFlexResult = UnsubscribeFn | boolean | undefined | null | void;
export type ComposedSubscriberFlexResult = SubscriberFlexResult | Iterable<SubscriberFlexResult>;

export type ComposedSubscriberFlex = (listener: () => void) => ComposedSubscriberFlexResult;
