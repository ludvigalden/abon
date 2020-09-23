import { AbonSet, resolve } from "../src";

describe("AbonSet", () => {
    it("constructs", () => {
        let set = new AbonSet<number>();

        expect(set.size).toBe(0);

        set = new AbonSet<number>([1, 2]);

        expect(set.size).toBe(2);
    });

    it("sets", () => {
        const set = new AbonSet<number>([0, 1, 2]);

        expect(set.has(0)).toBe(true);
        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
        expect(set.has(3)).toBe(false);

        set.set([0]);

        expect(set.has(0)).toBe(true);
        expect(set.has(1)).toBe(false);
    });

    it("modifies", () => {
        const set = new AbonSet<number>([0, 1]);

        expect(set.has(0)).toBe(true);
        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(false);

        set.modify([0], [1]);

        expect(set.has(0)).toBe(true);
        expect(set.has(1)).toBe(false);

        set.modify(null, [0]);

        expect(set.has(0)).toBe(false);

        set.modify([1]);

        expect(set.has(1)).toBe(true);
    });

    it("notifies", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(1));

        set.add(1);
        set.delete(1);
        set.add(2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies only on diff", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(1));

        set.add(1);

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(2));

        set.add(1);
        set.add(2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies on modification diff", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>();

        set.add(1);
        set.add(2);

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(4));

        set.modify([3, 4, 5, 6], [1, 2]);

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(0));

        set.modify([3, 4, 5, 6], [1, 2]);
        set.modify(undefined, [3, 4, 5, 6]);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies on clear", (done) => {
        const promises: Promise<any>[] = [];

        const set = new AbonSet<number>([1, 2]);

        set.modify([3, 4, 5, 6], [1, 2]);

        promises.push(expect(resolve(set).then(() => set.size)).resolves.toBe(0));

        set.clear();

        Promise.all(promises).then(() => done());
    }, 10);
});
