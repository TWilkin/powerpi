import { render, screen } from "@testing-library/react";
import FormattedValue, { getFormattedUnit, getFormattedValue } from "./FormattedValue";

jest.mock("../../../hooks/UserSettings", () => () => ({
    units: {
        gas: "m3",
        temperature: "K",
    },
}));

describe("FormattedValue", () => {
    test("percentage unit", () => {
        render(<FormattedValue type="humidity" value={75} unit="%" />);

        expect(screen.getByText("75%")).toBeInTheDocument();
    });

    test("m3 unit", () => {
        render(<FormattedValue type="gas" value={3} unit="m3" />);

        expect(screen.getByText("3 m\u00B3")).toBeInTheDocument();
    });

    test("converted unit", () => {
        render(<FormattedValue type="temperature" value={21} unit="°C" />);

        expect(screen.getByText("294.15 K")).toBeInTheDocument();
    });

    test("rounding", () => {
        render(<FormattedValue type="temperature" value={1.2345} unit="m" />);

        expect(screen.getByText("1.235 m")).toBeInTheDocument();
    });
});

describe("getFormattedValue", () => {
    test("undefined value", () => expect(getFormattedValue(undefined, "%")).toBeUndefined());
    test("undefined unit", () => expect(getFormattedValue(10, undefined)).toBeUndefined());

    test("50%", () => expect(getFormattedValue(50, "%")).toBe("50%"));
    test("32 F", () => expect(getFormattedValue(32, "F")).toBe("32 F"));
    test("5 m3", () => expect(getFormattedValue(5, "m3")).toBe("5 m\u00B3"));
});

describe("getFormattedUnit", () => {
    test("undefined unit", () => expect(getFormattedUnit(undefined)).toBe(""));

    test("F", () => expect(getFormattedUnit("F")).toBe("F"));
    test("m3", () => expect(getFormattedUnit("m3")).toBe("m\u00B3"));
});
