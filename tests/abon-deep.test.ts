import { Abon, AbonDeep } from "../src";

describe("AbonDeep", () => {
    let value: AbonDeep<V>;

    it("constructs", () => {
        value = new AbonDeep<V>();
    });

    it("set and get", () => {
        value.set("i", { j: 0 });
        expect(value.get("i", "j")).toBe(0);
        expect(value.get(["i", "j"])).toBe(0);
    });

    it("notifies", () => {
        value.set("a", "b", "c", { d: { e: 0 }, f: 0 });
        expect(
            Abon.resolve<number>((listener) => value.subscribe("a", "b", "c", "d", "e", listener)),
        ).resolves.toBe(1);
        value.set(["a", "b", "c", "d", "e"], 1);
    });
});

interface V {
    a: { b: { c: { d: { e: number }; f: number }; g: number }; h: number };
    i: { j: number };
    h: number;
}
