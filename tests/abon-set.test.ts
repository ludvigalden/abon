import { Abon, AbonSet } from "../src";

describe("AbonSet", () => {
    let set: AbonSet<number>;

    it("constructs", () => {
        set = new AbonSet();
        expect(set.size).toBe(0);
    });

    it("notifies", () => {
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(1);
        set.add(1);
        set.delete(1);
    });

    it("notifies only on diff", () => {
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(1);
        set.add(1);
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(2);
        set.add(1);
        set.add(2);
    });

    it("notifies on modification diff", () => {
        set.add(1);
        set.add(2);
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(4);
        set.modify([3, 4, 5, 6], [1, 2]);
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(0);
        set.modify([3, 4, 5, 6], [1, 2]);
        set.modify(undefined, [3, 4, 5, 6]);
    });

    it("notifies on clear", () => {
        set.modify([3, 4, 5, 6], [1, 2]);
        expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(0);
        set.clear();
    });
});
