import UnitConverter, { UnitValue } from "./UnitConverter";

describe("UnitConverter", () => {
    const subject = new UnitConverter();

    describe("temperature", () => {
        test("F -> K", () => check(subject.convert(100, "F", "K"), 310.928, "K"));
        test("K -> F", () => check(subject.convert(100, "K", "F"), -279.67, "F"));

        test("°C -> F", () => check(subject.convert(100, "°C", "F"), 212, "F"));
        test("F -> °C", () => check(subject.convert(100, "F", "°C"), 37.7778, "°C"));

        test("F -> m", () => check(subject.convert(100, "F", "m"), 100, "F"));
    });
});

function check(result: UnitValue, expectedValue: number, expectedUnit: string) {
    expect(result).not.toBeUndefined();
    expect(result.value).toBeCloseTo(expectedValue);
    expect(result.unit).toBe(expectedUnit);
}
