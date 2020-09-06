import { AbonInheritedDown } from "../src";

describe("AbonInheritedDown", () => {
    it("constructs", () => {
        const abon = new AbonInheritedDown(true);
        expect(abon.current).toBe(true);
    });
    it("nests and inherits", () => {
        const abon = new AbonInheritedDown(true);
        const nested = abon.nest();
        expect(nested.current).toBe(true);
    });
    it("nests and overwrites inherited", () => {
        const abon = new AbonInheritedDown(true);
        const nested = abon.nest();
        nested.set(false);
        expect(nested.current).toBe(false);
        expect(abon.current).toBe(true);
    });
    it("nests and overwrites inherited twice", () => {
        const abon = new AbonInheritedDown(true);
        const nested = abon.nest().set(false);
        const nested2 = nested.nest().set(true);
        expect(nested2.current).toBe(true);
        expect(nested.current).toBe(false);
        expect(abon.current).toBe(true);
    });
});
