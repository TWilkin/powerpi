import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Value from "./Value";

const mocks = vi.hoisted(() => ({
    converter: vi.fn(),
}));

vi.mock("../../hooks/useConversion", () => ({
    default: () => mocks.converter,
}));

describe("Value", () => {
    beforeEach(() => vi.resetAllMocks());

    test("renders no conversion", () => {
        mocks.converter.mockImplementation((_, value) => value);

        render(<Value type="temperature" value={10.1234} unit="K" />);

        expect(screen.getByText("10.123 K")).toBeInTheDocument();
    });

    test("renders conversion", () => {
        mocks.converter.mockImplementation(() => ({ value: -263.15, unit: "°C" }));

        render(<Value type="temperature" value={10} unit="K" />);

        expect(screen.getByText("-263.15 °C")).toBeInTheDocument();
    });

    test("renders no type", () => {
        render(<Value value={10} unit="K" />);

        expect(screen.getByText("10 K")).toBeInTheDocument();

        expect(mocks.converter).not.toHaveBeenCalled();
    });

    test("renders unrecognised", () => {
        render(<Value value={10} unit="bananas" />);

        expect(screen.getByText("10 bananas")).toBeInTheDocument();

        expect(mocks.converter).not.toHaveBeenCalled();
    });

    test("renders no data", () => {
        render(<Value />);

        expect(mocks.converter).not.toHaveBeenCalled();
    });
});
