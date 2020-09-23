import { AbonMap, resolve } from "../src";

describe("AbonMap", () => {
    it("constructs", () => {
        const map = new AbonMap();

        expect(map.size).toBe(0);
    });

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const map = new AbonMap<string, number>();

        promises.push(expect(resolve(map).then(() => map.size)).resolves.toBe(1));

        map.set("0", 0);
        map.delete("0");

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies only on diff", (done) => {
        const promises: Promise<any>[] = [];

        const map = new AbonMap<string, number>();

        map.set("X", 0);

        promises.push(expect(resolve(map).then(() => map.get("X"))).resolves.toBe(1));

        map.delete("$$$");
        map.set("X", 0);
        map.set("X", 1);

        promises.push(expect(resolve(map).then(() => map.size)).resolves.toBe(0));

        map.set("X", 1);
        map.delete("$$");
        map.delete("X");

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies only on deep diff", (done) => {
        const promises: Promise<any>[] = [];

        const deepMap = new AbonMap<string, object>();

        deepMap.set("X", { Y: { Z: 0 } });

        promises.push(expect(resolve(deepMap).then(() => deepMap.get("X"))).resolves.not.toMatchObject({ Y: { Z: 0 } }));

        deepMap.set("X", { Y: { Z: 0 } });
        deepMap.set("X", { Y: { Z: 1 } });
        deepMap.delete("X");

        Promise.all(promises).then(() => done());
    }, 10);
});
