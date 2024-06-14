import UnitConverter from "./UnitConverter";
import { UnitType, UnitValue } from "./types";

describe("UnitConverter", () => {
    const subject = new UnitConverter();

    describe("temperature", () => {
        test("F -> K", () => check("temperature", { value: 100, unit: "F" }, "K", 310.928, "K"));
        test("K -> F", () => check("temperature", { value: 100, unit: "K" }, "F", -279.67, "F"));

        test("°C -> F", () => check("temperature", { value: 100, unit: "°C" }, "F", 212, "F"));
        test("F -> °C", () => check("temperature", { value: 100, unit: "F" }, "°C", 37.7778, "°C"));

        test("°C -> K", () => check("temperature", { value: 100, unit: "°C" }, "K", 373.15, "K"));
        test("K -> °C", () => check("temperature", { value: 100, unit: "K" }, "°C", -173.15, "°C"));

        test("F -> m", () => check("temperature", { value: 100, unit: "F" }, "m", 100, "F"));
    });

    function check(
        type: UnitType,
        current: UnitValue,
        desiredUnit: string,
        expectedValue: number,
        expectedUnit: string,
    ) {
        const result = subject.convert(type, current, desiredUnit);

        expect(result).not.toBeUndefined();
        expect(result.value).toBeCloseTo(expectedValue);
        expect(result.unit).toBe(expectedUnit);
    }
});
