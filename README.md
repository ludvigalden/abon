
<p align="center">
  <img src="https://user-images.githubusercontent.com/30798446/76517645-f433e800-645d-11ea-8d85-e83424827956.png" width="230" height="230" alt="abon.js" />
</p>

<h3 align="center">
  Flexible state management for React &nbsp;🚀
</h3>

<br>

[![Stable Release](https://img.shields.io/npm/v/abon.svg)](https://npm.im/abon)
[![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://npm.im/abon)
[![gzip size](http://img.badgesize.io/https://unpkg.com/abon@latest/dist/abon.umd.production.min.js?compression=gzip)](https://unpkg.com/abon@latest/dist/abon.umd.production.min.js)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

---

Did you ever get tired of the lack of type-safeness or superflous code when using Redux? Or the decorator weirdness using MobX? Then you should `npm install abon`.

Now, using Abon requires a different approach to state. MobX and Redux, for example, requires you to build your state in a very specific way, and to subscribe to it in a very specific way as well. In Abon's point of view, a value can be stored anywhere, and be used anywhere—inside or outside of components. It can be passed down to components without requiring them to be subscribed to the values, or used inside components without forcing a re-render when updated. That is the immense flexibility that Abon allows for.

To learn more about how Abon can be used, you can check out [some of our examples](/examples).

## `Abon`

Allows for holding, setting and subscribing to a single value. Subscribers are only notified when the set value differs from the `current`, or if the `notify` method is used to manually notify subscribers.

```tsx
import { Abon } from "abon";

const authenticated = new Abon<boolean>(false);

function AuthMessage() {
    const auth = authenticated.use().current;

    if (!auth) {
        return <p>No access</p>;
    }

    return <p>Welcome</p>;
}
```

## `AbonDeep`

Allows for holding, setting, getting and subscribing to nested values. Subscribers are only notified when the set value differs from the current value (given the keys or lack of keys), or if the `notify` method is used to manually notify subscribers.

```typescript
import { AbonDeep } from "abon";

const value = new AbonDeep<{ a: { b: { c: number } } }>({ a: { b: { c: 0 } } });

value.subscribe(
    ["a", "b", "c"],
    (c) => { /** handle a.b.c */ })
);

value.subscribe(
    "a",
    (a) => { /** handle a */  })
);

value.set({
    a: { b: { c: 1 } }
});

value.set("a", "b", "c", 2);
```

## `AbonSet`

Extends `Set` with additional features allowing for setting and modifying values in one sweep. Whenever a value is added or deleted, subscribers are notified. They can also be notified manually using the `notify` method.

```tsx
import { AbonSet } from "abon";

const numbers = new AbonSet<number>([1, 2]);

function DisplayNumbers() {
    const numbersAmount = numbers.use().size

    if (numbersAmount > 0) {
        return <p>No numbers</p>;
    }

    return <p>Numbers: {numbersAmount}</p>;
}
```

## `AbonMap`

Extends `Map` with additional features allowing for setting and modifying values in one sweep. Whenever a value is added, modified or deleted, subscribers are notified. They can also be notified manually using the `notify` method, which accepts a set of keys if only specific keys should be notified.

```typescript
import { AbonMap } from "abon";

const userFollowers = new AbonMap<string, number>([["james", 10]]);
// [["james", 10]]
userFollowers.delete("james");
// []
userFollowers.set("dude", 12);
// [["dude", 12]]
userFollowers.set({
    james: 8,
})
// [["james", 8]]
userFollowers.set({
    james: 6,
    dude: 10
})
// [["james", 6], ["dude", 10]]
userFollowers.patch({
    dude: 12
})
// [["james", 6], ["dude", 12]]
```

```tsx
function UserFollowers(props: { userName: string }) {
    const followers = userFollowers.use(props.userName);

    return <p>Followers: {followers || 0}</p>;
}

function TotalFollowers() {
    const totalFollowers = Array.from(userFollowers.use().entries()).reduce(
        (totalFollowers, [userName, followers]) => totalFollowers + followers,
        0,
    );

    return <p>Total followers: {totalFollowers || 0}</p>;
}
```

## `AbonArray`

A subscribable implementation of a normal array, with some additional methods.

```typescript
import { AbonArray } from "abon";

const indexes = new AbonArray<number>();
indexes.push(2, 4, 5, 9);
const index = indexes.find(index => index > 5); // 9
```

## `AbonItems`

Allows for dynamically setting, pushing, unshifting, and subscribing to property-identified values. 

```typescript
import { AbonItems } from "abon";

const items = new AbonItems<{ itemId: number; name: string; }, "itemId">("itemId", [{ itemId: 5, name: "Jason" }]);

items.push({ itemId: 2, name: "Luke" })
// items.ids.current: [5, 2]
items.unshift({ itemId: 3, name: "Marie" })
// items.ids.current: [3, 5, 2]
items.set([{ itemId: 7, name: "Mason" }, { itemId: 1, name: "Chlorine" }])
// items.ids.current: [7, 1]
items.delete(7)
// items.ids.current: [1]
// items.items: [{ itemId: 1, name: "Chlorine" }]
// items.current: { 1: { itemId: 1, name: "Chlorine" } }
items.set(5, "name", "Jake")
// does not make difference because an item where `itemId === 5` does not exist
items.set(7, "name", "Charlotte")
// items.items: [{ itemId: 7, name: "Charlotte" }]

items.subscribe((current, items, ids) => {
    // items equal ids.map(id => current[id])
})
```

## `AbonAsync`

Allows for cancelling/overriding the process of setting values that are retrieved asynchronously by providing them as promises. For that purpose, the `set` methods accepts a promise whose value is to be set once it is resolved unless a different value is set during that time. Additionally, the `dispatch` method allows for handling promises unrelated to the value, meaning the passed handler is called if no new value is set during the time of the resolution of the passed promise.

```typescript
import { AbonAsync } from "abon";

const name = new AbonAsync<string>();

const namePromises = [
    new Promise((resolve) => setTimeout(() => resolve("Hjalmar"), 100)),
    new Promise((resolve) => setTimeout(() => resolve("Sören"), 400)),
    new Promise((resolve) => setTimeout(() => resolve("Rory"), 300)),
];

name.set(namePromises[3] /** Promise<"Rory"> */);
name.promise.then((currentName) => { /** "Sören", since it is set last. */ });
name.dispatch(Promise.resolve(), () => { /** Never called, because the next line is set before `Promise.resolve()` has been resolved. */ })
name.set(namePromises[2] /** Promise<"Sören"> */);

name.promise.then((currentName) => { /** "Sören", too. */ 
    name.set(namePromises[0] /** Promise<"Hjalmar"> */);
    name.promise.then((currentName) => { /** "Joker", since it is set last. */ });
    name.set("Joker");
});
```

## `AbonInheritedDown`

Imagine a tree of values, where all branches and sub-branches inherit from their parent, unless they have a value defined themselves. This is useful, for example, for having nodes that can inherit a status from their parents, such as a loading status for form fields in a form.

```typescript
import { AbonInheritedDown } from "abon";

const value = new AbonInheritedDown<number>(1);
const subValue = value.nest()
const subSubValue = subValue.nest()

value.current       // 1, from itself
subSubValue.current // 1, from `value`
subValue.set(2);
subSubValue.current // 2, from `subValue`
subValue.current    // 2, from itself
subSubValue.set(3);
subSubValue.current // 3, from itself
subSubValue.set(undefined);
subSubValue.current // 2, from `subValue`
subValue.set(undefined);
subSubValue.current // 1, from `value`
value.set(undefined)
subSubValue.current // undefined
subValue.current    // undefined
value.current       // undefined
```

## `AbonInheritedUp`

Every branch looks to itself or to any of its children (added using the `addChild` method) for a defined value.

```typescript
import { AbonInheritedDown } from "abon";

const name = new AbonInheritedUp<string>();
const subName = name.addChild();
const subSubName = subName.addChild()

name.current       // undefined
subSubName.set("Mike");
name.current       // "Mike", from `subSubName`
subName.current    // "Mike", from `subSubName`
subSubName.current // "Mike", from itself
subName.set("Oprah");
name.current       // "Oprah", from `subName`
subName.current    // "Oprah", from itself
subSubName.current // "Mike", from itself
subSubName.set(undefined);
name.current       // "Oprah", from `subName`
subName.current    // "Oprah", from itself
subSubName.current // undefined
subName.set(undefined);
name.current       // undefined
subName.current    // undefined
subSubName.current // undefined
```

## Utility

The `Abon` class provides some static utility for composing and constructing the instances described above.

### `Abon.useComposedValue`

Create an Abon with a value based on one or more subscriptions. Dependencies can be passed as a third argument, which means the value will be recalculated if either (1) the listener is notified or (2) the dependencies have changed. Changing the dependencies also re-subscribes (meaning you can change the subscriptions).

There is also `Abon.useComposedValueAsync`, which allows for returning a promise from the getter function, meaning the value returned from the hook will be undefined at first.

```tsx
import { Abon, AbonDeep } from "abon";

function PriceStatus() {
    const price = Abon.useRef<number>(() => 10);
    const fullPrice = Abon.useRef<number>(() => 100);

    // `0.1` initially, then changes when `fullPrice` or `price` change
    const priceFraction = Abon.useComposedValue(
        () => price.current / fullPrice,
        (listener) => [fullPrice.subscribe(listener), price.subscribe(listener)],
        [price, fullPrice]
    );

    if (priceFraction < 0.1) {
        return <p>Good price!</p>;
    }

    return <p>Bad price.</p>;
}
```

### `Abon.resolve`

Returns a promise resolved by the next value set to the provided `Abon`. You can also pass a function accepting a listener and returning a created subscription, which will resolve the promise with the value that is passed to the listener.

```tsx
import { Abon } from "abon";

const value = new Abon(0);

Abon.resolve(value).then((_value) => { /** 1 */ })
value.set(1);
```

## Authors

- Ludvig Aldén [@ludvigalden](https://github.com/ludvigalden)

---

[MIT License.](https://github.com/ludvigalden/abon/blob/master/LICENSE)
