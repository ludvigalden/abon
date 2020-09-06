import { AbonInheritedUp } from "../src";

describe("AbonInheritedUp", () => {
    it("constructs", () => {
        const abon = new AbonInheritedUp<number>();
        expect(abon.current).toBe(undefined);
        abon.set(3);
        expect(abon.current).toBe(3);
    });
    it("nests and inherits", () => {
        const abon = new AbonInheritedUp<number | undefined>();
        const firstChild = abon.addChild();
        expect(abon.current).toBe(undefined);
        expect(firstChild.current).toBe(undefined);
        firstChild.set(2);
        expect(abon.current).toBe(2);
        expect(firstChild.current).toBe(2);
        const secondChild = abon.addChild();
        expect(abon.current).toBe(2);
        expect(secondChild.current).toBe(undefined);
        abon.removeChild(firstChild);
        expect(abon.current).toBe(undefined);
        expect(firstChild.current).toBe(2);
        expect(secondChild.current).toBe(undefined);
        secondChild.set(3);
        expect(abon.current).toBe(3);
        expect(secondChild.current).toBe(3);
        abon.set(1);
        expect(abon.current).toBe(1);
        abon.set(undefined);
        expect(abon.current).toBe(3);
        abon.addChild(firstChild);
        expect(abon.current).toBe(3);
        expect(firstChild.current).toBe(2);
        expect(secondChild.current).toBe(3);
        abon.removeChild(secondChild);
        expect(abon.current).toBe(2);
        expect(firstChild.current).toBe(2);
        abon.removeChild(firstChild);
        expect(abon.current).toBe(undefined);
        abon.set(1);
        expect(abon.current).toBe(1);
    });
});
