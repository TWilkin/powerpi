import {
    getUnitLabel,
    isSupportedUnit,
    isSupportedUnitLabel,
    SupportedUnit,
} from "./isSupportedUnit";

describe("isSupportedUnit", () => {
    const cases: { unit: string; expected: boolean }[] = [
        { unit: "%", expected: true },
        { unit: "Wh", expected: true },
        { unit: "kWh", expected: true },
        { unit: "°C", expected: true },
        { unit: "K", expected: true },
        { unit: "F", expected: true },
        { unit: "m3", expected: true },
        { unit: "cf", expected: true },
        { unit: "hcf", expected: true },
        { unit: "?", expected: false },
    ];
    test.each(cases)("$unit => $expected", ({ unit, expected }) => {
        const result = isSupportedUnit(unit);

        expect(result).toBe(expected);
    });
});

describe("isSupportedUnitLabel", () => {
    const cases: { label: string; expected: boolean }[] = [
        { label: "percentage", expected: true },
        { label: "watt hours", expected: true },
        { label: "kilowatt hours", expected: true },
        { label: "celsius", expected: true },
        { label: "kelvin", expected: true },
        { label: "fahrenheit", expected: true },
        { label: "metres cubed", expected: true },
        { label: "cubic feet", expected: true },
        { label: "hundred cubic feet", expected: true },
        { label: "?", expected: false },
    ];
    test.each(cases)("$label => $expected", ({ label, expected }) => {
        const result = isSupportedUnitLabel(label);

        expect(result).toBe(expected);
    });
});

describe("getUnitLabel", () => {
    const cases: { unit: SupportedUnit; expected: string | undefined }[] = [
        { unit: "%", expected: "percentage" },
        { unit: "Wh", expected: "watt hours" },
    ];
    test.each(cases)("$unit => $expected", ({ unit, expected }) => {
        const result = getUnitLabel(unit);

        expect(result).toBe(expected);
    });
});
