import UnitConverter from "./UnitConverter";
import { UnitType, UnitValue } from "./types";

describe("UnitConverter", () => {
    const subject = new UnitConverter();

    describe("gas", () => {
        test("m3 -> kWh", () => check("gas", { value: 100, unit: "m3" }, "kWh", 1_079.45));
        test("m3 -> Wh", () => check("gas", { value: 100, unit: "m3" }, "Wh", 1.07945));

        test("cf -> kWh", () => check("gas", { value: 5_000, unit: "cf" }, "kWh", 1_528.335));

        test("hcf -> kWh", () => check("gas", { value: 50, unit: "hcf" }, "kWh", 1_528.335));
    });

    describe("power", () => {
        test("kWh -> Wh", () => check("power", { value: 100, unit: "kWh" }, "Wh", 0.1));

        test("Wh -> kWh", () => check("power", { value: 100, unit: "Wh" }, "kWh", 100_000));
    });

    describe("temperature", () => {
        test("F -> K", () => check("temperature", { value: 100, unit: "F" }, "K", 310.928));
        test("K -> F", () => check("temperature", { value: 100, unit: "K" }, "F", -279.67));

        test("°C -> F", () => check("temperature", { value: 100, unit: "°C" }, "F", 212));
        test("F -> °C", () => check("temperature", { value: 100, unit: "F" }, "°C", 37.7778));

        test("°C -> K", () => check("temperature", { value: 100, unit: "°C" }, "K", 373.15));
        test("K -> °C", () => check("temperature", { value: 100, unit: "K" }, "°C", -173.15));

        test("F -> m", () => check("temperature", { value: 100, unit: "F" }, "m", 100, "F"));
    });

    describe("volume", () => {
        test("m3 -> hcf", () => check("volume", { value: 100, unit: "m3" }, "cf", 3531.47));

        test("cf -> hcf", () => check("volume", { value: 123, unit: "cf" }, "hcf", 1.23));
        test("cf -> m3", () => check("volume", { value: 5_000, unit: "cf" }, "m3", 141.584));

        test("hcf -> cf", () => check("volume", { value: 50, unit: "hcf" }, "cf", 5_000));
        test("hcf -> m3", () => check("volume", { value: 50, unit: "hcf" }, "m3", 141.584));
    });

    function check(
        type: UnitType,
        current: UnitValue,
        desiredUnit: string,
        expectedValue: number,
        expectedUnit: string = desiredUnit,
    ) {
        const result = subject.convert(type, current, desiredUnit);

        expect(result).not.toBeUndefined();
        expect(result.value).toBeCloseTo(expectedValue);
        expect(result.unit).toBe(expectedUnit);
    }
});
