import { AbonEvent, Abon } from "../src";

describe("AbonEvent", () => {
    it("notifies number", (done) => {
        const promises: Promise<any>[] = [];

        const event = new AbonEvent<number, number>();

        promises.push(
            expect(
                Abon.resolve<undefined>((listener) => event.subscribe(0, 1, listener)),
            ).resolves.toBe(undefined),
            expect(
                Abon.resolve<number>((listener) => event.subscribe(0, listener)),
            ).resolves.toBe(1),
            expect(
                Abon.resolve<number>((listener) => event.subscribe(1, listener)),
            ).resolves.toBe(2),
            expect(
                Abon.resolve<number>((listener) => event.subscribe(listener)),
            ).resolves.toBe(0),
        );

        event.notify(0, 1);

        promises.push(
            expect(
                Abon.resolve<number>((listener) => event.subscribe(listener)),
            ).resolves.toBe(1),
        );

        event.notify(1, 2);

        Promise.all(promises).then(() => done());
    }, 10);

    it("notifies object", (done) => {
        const promises: Promise<any>[] = [];

        const object = { 0: {}, 1: {}, 2: {} };

        const event = new AbonEvent<object, object>();

        promises.push(
            expect(
                Abon.resolve<undefined>((listener) => event.subscribe(object[0], object[1], listener)),
            ).resolves.toStrictEqual(undefined),
            expect(
                Abon.resolve<object>((listener) => event.subscribe(object[0], listener)),
            ).resolves.toStrictEqual(object[1]),
            expect(
                Abon.resolve<object>((listener) => event.subscribe(object[1], listener)),
            ).resolves.toStrictEqual(object[2]),
            expect(
                Abon.resolve<object>((listener) => event.subscribe(listener)),
            ).resolves.toStrictEqual(object[0]),
        );

        event.notify(object[0], object[1]);

        promises.push(
            expect(
                Abon.resolve<object>((listener) => event.subscribe(listener)),
            ).resolves.toStrictEqual(object[1]),
        );

        event.notify(object[1], object[2]);

        Promise.all(promises).then(() => done());
    }, 10);
});
