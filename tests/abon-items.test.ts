import { Abon, AbonItems } from "../src";

describe("AbonItems", () => {
    it("constructs", () => {
        new AbonItems<Item, "id">("id");
    });

    it("set and push", () => {
        const items = new AbonItems<Item, "id">("id");

        items.set([{ id: 0 }, { id: 5 }]);
        items.push({ id: 2 });

        expect(items.ids.current.includes(0)).toBe(true);
        expect(items.ids.current.includes(1)).toBe(false);
        expect(items.ids.current.includes(2)).toBe(true);
        expect(items.current[0].id).toBe(0);
        expect(items.ids.current.includes(5)).toBe(true);
    });

    it("id location", () => {
        const items = new AbonItems<Item, "id">("id");

        items.set([{ id: 0 }, { id: 5 }]);
        items.push({ id: 2 });

        expect(items.ids.current[0]).toEqual(0);
        expect(items.ids.current[1]).toEqual(5);
        expect(items.ids.current[2]).toEqual(2);

        items.unshift({ id: 2 });

        expect(items.ids.current[2]).toEqual(5);

        items.push({ id: 2 });

        expect(items.ids.current[0]).toEqual(0);
        expect(items.ids.current[1]).toEqual(5);
        expect(items.ids.current[2]).toEqual(2);
    });

    it("notifies value change", (done) => {
        const promises: Promise<any>[] = [];

        const items = new AbonItems<Item, "id">("id");

        items.push({ id: 20, value: 1 });

        promises.push(
            expect(
                Abon.resolve<number>((listener) => items.subscribe(20, "value", listener)),
            ).resolves.toBe(2),
        );

        items.set(20, "value", 2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies value push", (done) => {
        const promises: Promise<any>[] = [];

        const items = new AbonItems<Item, "id">("id");

        items.push({ id: 50, value: 1 });

        promises.push(
            expect(
                Abon.resolve<number>((listener) => items.subscribe((_, values) => listener(values.length))),
            ).resolves.toBe(2),
        );

        items.push({ id: 100 });

        Promise.all(promises).then(() => done());
    }, 10);
});

interface Item {
    id: number;

    name?: string;
    value?: number;
}
