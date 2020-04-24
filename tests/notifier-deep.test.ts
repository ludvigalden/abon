import { NotifierDeep } from "../src/notifier";

describe("NotifierDeep", () => {
    it("gets matches", () => {
        const notifier = new NotifierDeep();

        notifier.subscribe(["a", "b", "c", "d", "e"], () => {});
        notifier.subscribe(["a", "b", "x", "y"], () => {});

        expect(notifier.getRelated(["a"]).size).toBe(2);
        expect(notifier.getRelated(["a", "b"]).size).toBe(2);
        expect(notifier.getRelated(["a", "b", "c"]).size).toBe(1);
        expect(notifier.getRelated(["a", "b", "c", "d"]).size).toBe(1);
        expect(notifier.getRelated(["a", "b", "c", "d", "e"]).size).toBe(1);
        expect(notifier.getRelated(["a", "b", "x"]).size).toBe(1);
        expect(notifier.getRelated(["a", "b", "x", "y"]).size).toBe(1);
    });
});
