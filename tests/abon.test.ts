import { Abon } from "../src";

describe("Abon", () => {
    let number: Abon<number>;

    it("constructs", () => {
        number = new Abon(0);

        expect(number.current).toEqual(0);
    });

    it("notifies", () => {
        expect(Abon.resolve(number)).resolves.toEqual(1);
        number.set(1);
        number.set(2);
    });

    it("notifies only on diff", () => {
        number.set(3);
        expect(Abon.resolve(number)).resolves.toEqual(4);
        number.set(3);
        number.set(4);
    });
});
