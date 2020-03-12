import { Abon, AbonMap } from "../src";

describe("AbonMap", () => {
    let map: AbonMap<string, number>;

    it("constructs", () => {
        map = new AbonMap();
        expect(map.size).toBe(0);
    });

    it("notifies", () => {
        expect(Abon.resolve(map).then(() => map.size)).resolves.toBe(1);
        map.set("0", 0);
        map.delete("0");
    });

    it("notifies only on diff", () => {
        map.set("X", 0);
        expect(Abon.resolve(map).then(() => map.get("X"))).resolves.toBe(1);
        map.delete("$$$");
        map.set("X", 0);
        map.set("X", 1);

        expect(Abon.resolve(map).then(() => map.size)).resolves.toBe(0);
        map.set("X", 1);
        map.delete("$$");
        map.delete("X");
    });

    it("notifies only on deep diff", () => {
        const deepMap = new AbonMap<string, object>();

        deepMap.set("X", { Y: { Z: 0 } });
        expect(Abon.resolve(map).then(() => map.get("X"))).resolves.not.toMatchObject({ Y: { Z: 0 } });
        deepMap.set("X", { Y: { Z: 0 } });
        deepMap.set("X", { Y: { Z: 1 } });
        deepMap.delete("X");
    });
});
