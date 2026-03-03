import UnitConverter from "./UnitConverter";
import { UnitType, UnitValue } from "./types";

describe("UnitConverter", () => {
    describe("current", () => {
        test("mA -> A", () => check("current", { value: 100, unit: "mA" }, "A", 0.1));

        test("A -> mA", () => check("current", { value: 0.1, unit: "A" }, "mA", 100));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("current");

            expect(result).toContainEqual({ unit: "mA", key: "milliampere" });
            expect(result).toContainEqual({ unit: "A", key: "ampere" });
        });
    });

    describe("electricalPotential", () => {
        test("mV -> V", () => check("electricalPotential", { value: 100, unit: "mV" }, "V", 0.1));

        test("V -> mV", () => check("electricalPotential", { value: 0.1, unit: "V" }, "mV", 100));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("electricalPotential");

            expect(result).toContainEqual({ unit: "mV", key: "millivolt" });
            expect(result).toContainEqual({ unit: "V", key: "volt" });
        });
    });

    describe("energy", () => {
        test("Wh -> kWh", () => check("energy", { value: 100, unit: "Wh" }, "kWh", 0.1));
        test("Wh -> J", () => check("energy", { value: 3600, unit: "Wh" }, "J", 1));

        test("kWh -> Wh", () => check("energy", { value: 100, unit: "kWh" }, "Wh", 100_000));

        test("J -> Wh", () => check("energy", { value: 100, unit: "J" }, "Wh", 360_000));
        test("J -> kJ", () => check("energy", { value: 100, unit: "J" }, "kJ", 0.1));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("energy");

            expect(result).toContainEqual({ unit: "Wh", key: "watt hours" });
            expect(result).toContainEqual({ unit: "kWh", key: "kilowatt hours" });
            expect(result).toContainEqual({ unit: "J", key: "joule" });
            expect(result).toContainEqual({ unit: "kJ", key: "kilojoule" });
        });
    });

    describe("gas", () => {
        test("m3 -> kWh", () => check("gas", { value: 100, unit: "m3" }, "kWh", 1_079.45));
        test("m3 -> Wh", () => check("gas", { value: 100, unit: "m3" }, "Wh", 1_079_453.33));
        test("m3 -> J", () => check("gas", { value: 100, unit: "m3" }, "J", 299.848));

        test("cf -> kWh", () => check("gas", { value: 5_000, unit: "cf" }, "kWh", 1_528.335));

        test("hcf -> kWh", () => check("gas", { value: 50, unit: "hcf" }, "kWh", 1_528.335));

        test("kWh -> m3", () => check("gas", { value: 1_079.45, unit: "kWh" }, "m3", 100));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("gas");

            expect(result).toContainEqual({ unit: "m3", key: "metres cubed" });
            expect(result).toContainEqual({ unit: "kWh", key: "kilowatt hours" });
            expect(result).toContainEqual({ unit: "hcf", key: "hundred cubic feet" });
            expect(result).toContainEqual({ unit: "Mcf", key: "thousand cubic feet" });
            expect(result).toContainEqual({ unit: "cf", key: "cubic feet" });
        });
    });

    describe("power", () => {
        test("W -> kW", () => check("power", { value: 50, unit: "W" }, "kW", 0.05));

        test("kW -> W", () => check("power", { value: 50, unit: "kW" }, "W", 50_000));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("power");

            expect(result).toContainEqual({ unit: "W", key: "watt" });
            expect(result).toContainEqual({ unit: "kW", key: "kilowatt" });
        });
    });

    describe("temperature", () => {
        test("F -> K", () => check("temperature", { value: 100, unit: "F" }, "K", 310.928));
        test("K -> F", () => check("temperature", { value: 100, unit: "K" }, "F", -279.67));

        test("°C -> F", () => check("temperature", { value: 100, unit: "°C" }, "F", 212));
        test("F -> °C", () => check("temperature", { value: 100, unit: "F" }, "°C", 37.7778));

        test("°C -> K", () => check("temperature", { value: 100, unit: "°C" }, "K", 373.15));
        test("K -> °C", () => check("temperature", { value: 100, unit: "K" }, "°C", -173.15));

        test("F -> m", () => check("temperature", { value: 100, unit: "F" }, "m", 100, "F"));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("temperature");

            expect(result).toContainEqual({ unit: "°C", key: "celsius" });
            expect(result).toContainEqual({ unit: "K", key: "kelvin" });
            expect(result).toContainEqual({ unit: "F", key: "fahrenheit" });
        });
    });

    describe("volume", () => {
        test("m3 -> hcf", () => check("volume", { value: 100, unit: "m3" }, "cf", 3531.47));

        test("cf -> hcf", () => check("volume", { value: 123, unit: "cf" }, "hcf", 1.23));
        test("cf -> Mcf", () => check("volume", { value: 5_000, unit: "cf" }, "Mcf", 5));
        test("cf -> m3", () => check("volume", { value: 5_000, unit: "cf" }, "m3", 141.584));

        test("hcf -> cf", () => check("volume", { value: 50, unit: "hcf" }, "cf", 5_000));
        test("hcf -> Mcf", () => check("volume", { value: 50, unit: "hcf" }, "Mcf", 5));
        test("hcf -> m3", () => check("volume", { value: 50, unit: "hcf" }, "m3", 141.584));

        test("Mcf -> cf", () => check("volume", { value: 25, unit: "Mcf" }, "cf", 25_000));
        test("Mcf -> hcf", () => check("volume", { value: 25, unit: "Mcf" }, "hcf", 250));

        test("getConverters", () => {
            const result = UnitConverter.getConverters("volume");

            expect(result).toContainEqual({ unit: "m3", key: "metres cubed" });
            expect(result).toContainEqual({ unit: "hcf", key: "hundred cubic feet" });
            expect(result).toContainEqual({ unit: "Mcf", key: "thousand cubic feet" });
            expect(result).toContainEqual({ unit: "cf", key: "cubic feet" });
        });
    });

    function check(
        type: UnitType,
        current: UnitValue,
        desiredUnit: string,
        expectedValue: number,
        expectedUnit: string = desiredUnit,
    ) {
        const result = UnitConverter.convert(type, current, desiredUnit);

        expect(result).not.toBeUndefined();
        expect(result.value).toBeCloseTo(expectedValue);
        expect(result.unit).toBe(expectedUnit);
    }
});
