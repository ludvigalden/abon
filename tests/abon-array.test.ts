import { Abon, AbonArray } from "../src";

describe("AbonArray", () => {
    const item: T = { x: 0 };

    it("constructs", () => {
        const array = new AbonArray<T>([item]);

        expect(array.length).toBe(1);
    });

    it("set", () => {
        const array = new AbonArray<T>();

        array.set([item]);

        expect(array.length).toBe(1);
        expect(array.includes(item)).toBe(true);
    });

    it("includes", () => {
        const array = new AbonArray<T>();

        array.set([item]);

        expect(array.length).toBe(1);
        expect(array.includes(item)).toBe(true);
    });

    it("push", () => {
        const array = new AbonArray<T>();

        array.push(item);

        expect(array.length).toBe(1);
        expect(array.includes(item)).toBe(true);
    });

    it("unshift", () => {
        const array = new AbonArray<T>();

        array.unshift(item);

        expect(array.length).toBe(1);
        expect(array.includes(item)).toBe(true);
    });

    it("pop", () => {
        const array = new AbonArray<T>([item]);

        expect(array.length).toBe(1);
        expect(array.pop() === item).toBe(true);
        expect(array.length).toBe(0);
    });

    const item1: T = { x: 1 };

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const array = new AbonArray<T>([item, item, item]);

        expect(array.length).toBe(3);

        promises.push(
            expect(
                Abon.resolve<T>((listener) => array.subscribe((items) => listener(items[0]))),
            ).resolves.toBe(item1),
        );

        array.unshift(item1);

        promises.push(
            expect(
                Abon.resolve<T>((listener) => array.subscribe((items) => listener(items[0]))),
            ).resolves.toBe(undefined),
        );

        array.set([]);

        Promise.all(promises).then(() => done());
    }, 10);
});

interface T {
    x: number;
}
