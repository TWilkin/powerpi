import getSensorType from "./getSensorType";

describe("getSensorType", () => {
    const cases: { type: string; expected: string | undefined }[] = [
        { type: "door", expected: "door" },
        { type: "electricity", expected: "electricity" },
        { type: "gas", expected: "gas" },
        { type: "humidity", expected: "humidity" },
        { type: "motion", expected: "motion" },
        { type: "switch", expected: "switch" },
        { type: "temperature", expected: "temperature" },
        { type: "window", expected: "window" },
        { type: "aqara_door", expected: "door" },
        { type: "osram_switch_mini", expected: "switch" },
        { type: "something unexpected", expected: undefined },
    ];
    test.each(cases)("$type => $expected", ({ type, expected }) => {
        const result = getSensorType(type);

        expect(result).toBe(expected);
    });
});
