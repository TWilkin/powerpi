import getUnitType from "./getUnitType";
import { UnitType } from "./types";

describe("getUnitType", () => {
    const cases: { type: string; unit?: string; expected: UnitType | undefined }[] = [
        { type: "current", expected: "current" },
        { type: "electricalPotential", expected: "electricalPotential" },
        { type: "energy", expected: "energy" },
        { type: "gas", expected: "gas" },
        { type: "power", expected: "power" },
        { type: "temperature", expected: "temperature" },
        { type: "volume", expected: "volume" },
        { type: "nope", unit: "mA", expected: "current" },
        { type: "nope", unit: "A", expected: "current" },
        { type: "nope", unit: "mV", expected: "electricalPotential" },
        { type: "nope", unit: "V", expected: "electricalPotential" },
        { type: "nope", unit: "Wh", expected: "energy" },
        { type: "nope", unit: "kWh", expected: "energy" },
        { type: "nope", unit: "W", expected: "power" },
        { type: "nope", unit: "kW", expected: "power" },
        { type: "nope", unit: "°C", expected: "temperature" },
        { type: "nope", unit: "K", expected: "temperature" },
        { type: "nope", unit: "F", expected: "temperature" },
        { type: "nope", unit: "m3", expected: "volume" },
        { type: "nope", unit: "cf", expected: "volume" },
        { type: "nope", unit: "hcf", expected: "volume" },
        { type: "nope", unit: "Mcf", expected: "volume" },
        { type: "nope", unit: "nope", expected: undefined },
    ];
    test.each(cases)(
        "type $type unit $unit => $expected",
        ({ type, unit = "anything", expected }) => {
            const result = getUnitType(type, unit);

            expect(result).toBe(expected);
        },
    );
});
