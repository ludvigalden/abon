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

export interface Subscribeable<T> {
    subscribe(listener: ChangeListener<T>): UnsubscribeFn;
}
