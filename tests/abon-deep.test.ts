import { AbonDeep, resolve } from "../src";

describe("AbonDeep", () => {
    it("constructs", () => {
        new AbonDeep<V>();
    });

    it("strings and numbers are created equally as keys", () => {
        const obj: any = {};

        AbonDeep.set(obj, [0, "name"], "Zero");
        AbonDeep.set(obj, ["0", "name"], "ZeroString");

        expect(AbonDeep.get(obj, [0, "name"])).toEqual("ZeroString");
    });

    it("correct set and get function for nested arrays", () => {
        const obj = { items: [{ name: "Item" }], itemRecord: { 0: { name: "RecordItem" } } };

        AbonDeep.set(obj, ["items", 0, "name"], "Item");
        expect(Array.isArray(AbonDeep.get(obj, ["items"]))).toBe(true);

        AbonDeep.set(obj, ["items", 0, "subItems", 0], { name: "SubItem" });
        expect(Array.isArray(AbonDeep.get(obj, ["items", 0, "subItems"]))).toBe(true);

        AbonDeep.set(obj, ["itemRecord", 0, "name"], "RecordItem");
        expect(Array.isArray(AbonDeep.get(obj, ["itemRecord"]))).toBe(false);

        AbonDeep.set(obj, ["itemRecord", 0, "subItems"], [{ name: "RecordSubItem" }]);
        expect(Array.isArray(AbonDeep.get(obj, ["itemRecord", 0, "subItems"]))).toBe(true);

        AbonDeep.set(obj, ["itemRecord", 0, "subItems", 0, "name"], "RecordSubItem");
        expect(Array.isArray(AbonDeep.get(obj, ["itemRecord", 0, "subItems"]))).toBe(true);
    });

    it("set and get", () => {
        const value = new AbonDeep<V>();

        value.set("i", { j: 0 });

        expect(value.get("i", "j")).toBe(0);
        expect(value.get(["i", "j"])).toBe(0);
    });

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const value = new AbonDeep<VH>();

        value.set({ h: 1 });

        promises.push(
            expect(
                resolve<VH>((listener) => value.subscribe(listener)),
            ).resolves.toMatchObject({ h: 2 }),
        );

        value.set({ h: 2 });

        promises.push(
            expect(
                resolve<VH>((listener) => value.subscribe(listener)),
            ).resolves.toMatchObject({ h: 3 }),
        );

        value.set("h", 3);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies deep", (done) => {
        const promises: Promise<any>[] = [];

        const value = new AbonDeep<V>();

        value.set("a", "b", "c", { d: { e: 0 }, f: 0 });

        promises.push(
            expect(
                resolve<number>((listener) => value.subscribe("a", "b", "c", "d", "e", listener)),
            ).resolves.toBe(1),
        );

        value.set(["a", "b", "c", "d", "e"], 1);

        Promise.all(promises).then(() => done());
    }, 10);
});

interface VH {
    h: number;
}

interface V extends VH {
    a: { b: { c: { d: { e: number }; f: number }; g: number }; h: number };
    i: { j: number };
}
