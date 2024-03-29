import { AbonAsync } from "../src";

describe("AbonAsync", () => {
    interface Animal {
        name: string;
    }
    const animals = {
        cow: { name: "Cow" } as Animal,
        horse: { name: "Horse" } as Animal,
        pig: { name: "Pig" } as Animal,
        sheep: { name: "Sheep" } as Animal,
    };
    it("constructs", () => {
        const animal = new AbonAsync(animals.cow);
        expect(animal.current).toStrictEqual(animals.cow);
    });
    it("dispatches correctly", (done) => {
        const promises: Promise<any>[] = [];

        const animal = new AbonAsync(animals.cow);
        promises.push(expect(animal.promise).resolves.toBe(animals.cow));

        promises.push(
            animal.set(
                new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(animals.horse);
                    }, 4),
                ),
            ),
        );
        promises.push(
            animal.set(
                new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(animals.pig);
                    }, 8),
                ),
            ),
        );
        const result = animal
            .set(
                new Promise((resolve) =>
                    setTimeout(() => {
                        resolve(animals.sheep);
                    }, 12),
                ),
            )
            .then(() => animal.current);
        promises.push(expect(result).resolves.toBe(animals.sheep));

        Promise.all(promises).then(() => done());
    }, 50);
});
