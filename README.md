
<p align="center">
  <img src="https://user-images.githubusercontent.com/30798446/76517645-f433e800-645d-11ea-8d85-e83424827956.png" width="230" height="230" alt="abon.js" />
</p>

<h3 align="center">
  Complex state in React made simple &nbsp;🚀
</h3>

<br>

[![Stable Release](https://img.shields.io/npm/v/abon.svg)](https://npm.im/abon)
[![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://npm.im/abon)
[![gzip size](http://img.badgesize.io/https://unpkg.com/abon@latest/dist/abon.umd.production.min.js?compression=gzip)](https://unpkg.com/abon@latest/dist/abon.umd.production.min.js)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

---

Did you ever get tired of the lack of type-safeness or superflous code when using Redux? Or the decorator weirdness using MobX? Then you should `npm install abon`.

## `Abon`

Allows for holding, setting and subscribing to a single value. Subscribers are only notified when the set value differs from the `current`, or if the `notify` method is used to manually notify subscribers.

```tsx
import { Abon } from "abon";

const authenticated = new Abon<boolean>(false);

authenticated.subscribe(
    (auth) => console.log("auth:", auth)
);


function AuthMessage() {
    const auth = authenticated.use();

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

const value = new AbonDeep<{ a; b: { c: number } }>({ a: { b: { c: 0 } } });

value.subscribe(
    ["a", "b", "c"],
    (c) => {
        // "1"
        // "2"
        console.log("c:", c);
    })
);

value.subscribe(
    "a",
    (a) => {
        // "{ b: { c: 1 } }"
        // "{ b: { c: 2 } }"
        console.log("a:", a)
    })
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

authenticated.subscribe(
    (nums) => console.log("nums:", Array.from(nums.values()))
);


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
userFollowers.modify({
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
        (totalFollowers, [name, followers]) => totalFollowers + followers,
        0,
    );

    return <p>Total followers: {totalFollowers || 0}</p>;
}
```

## `AbonItems`

Allows for dynamically setting, pushing, unshifting, and subscribing to identified values ("items").

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

## Utility

The `Abon` class provides some static utility for composing and constructing the instances described above.

### `Abon.useComposedValue`

There is also `Abon.useComposedValueAsync` which allows for returning a promise from the getter function, meaning the value returned from the hook will be undefined at first.

Dependencies can be passed as a third argument, which means the value will be recalculated if either (1) the listener is notified or (2) the dependencies have changed. Changing the dependencies also re-subscribes (meaning you can change the subscriptions).

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

Abon.resolve(value).then((_value) => {
    // "1"
    console.log(_value);
})

value.set(1);
```

## Authors

- Ludvig Aldén [@ludvigalden](https://github.com/ludvigalden)

---

[MIT License.](https://github.com/ludvigalden/abon/blob/master/LICENSE)
