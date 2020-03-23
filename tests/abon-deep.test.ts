import { Abon, AbonDeep } from "../src";

describe("AbonDeep", () => {
    it("constructs", () => {
        new AbonDeep<V>();
    });

    it("set and get", () => {
        const value = new AbonDeep<V>();

        value.set("i", { j: 0 });

        expect(value.get("i", "j")).toBe(0);
        expect(value.get(["i", "j"])).toBe(0);
    });

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const value = new AbonDeep<V>();

        value.set("a", "b", "c", { d: { e: 0 }, f: 0 });

        promises.push(
            expect(
                Abon.resolve<number>((listener) => value.subscribe("a", "b", "c", "d", "e", listener)),
            ).resolves.toBe(1),
        );

        value.set(["a", "b", "c", "d", "e"], 1);

        Promise.all(promises).then(() => done());
    }, 10);
});

interface V {
    a: { b: { c: { d: { e: number }; f: number }; g: number }; h: number };
    i: { j: number };
    h: number;
}
