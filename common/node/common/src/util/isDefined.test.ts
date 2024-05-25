import isDefined from "./isDefined";

describe("isDefined", () =>
    [
        { value: undefined, expected: false },
        { value: null, expected: false },
        { value: "a", expected: true },
        { value: 0, expected: true },
        { value: 1, expected: true },
    ].forEach(({ value, expected }) =>
        test(`${value} => ${expected}`, () => expect(isDefined(value)).toBe(expected)),
    ));
