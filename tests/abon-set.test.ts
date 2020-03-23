import { Abon, AbonSet } from "../src";

describe("AbonSet", () => {
    it("constructs", () => {
        let set = new AbonSet<number>();

        expect(set.size).toBe(0);

        set = new AbonSet<number>([1, 2]);

        expect(set.size).toBe(2);
    });

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(1));

        set.add(1);
        set.delete(1);
        set.add(2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies only on diff", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(1));

        set.add(1);

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(2));

        set.add(1);
        set.add(2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies on modification diff", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        set.add(1);
        set.add(2);

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(4));

        set.modify([3, 4, 5, 6], [1, 2]);

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(0));

        set.modify([3, 4, 5, 6], [1, 2]);
        set.modify(undefined, [3, 4, 5, 6]);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies on clear", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>([1, 2]);

        set.modify([3, 4, 5, 6], [1, 2]);

        promises.push(expect(Abon.resolve(set).then(() => set.size)).resolves.toBe(0));

        set.clear();

        Promise.all(promises).then(() => done());
    }, 10);
});
