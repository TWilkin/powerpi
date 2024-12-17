import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import getTextWidth from "./getTextWidth";

const mocks = vi.hoisted(() => ({
    getContext: vi.fn(),
}));

describe("getTextWidth", () => {
    beforeAll(() => (HTMLCanvasElement.prototype.getContext = mocks.getContext));

    test("works", () => {
        const context = {
            font: "",
            measureText: vi.fn(),
        };

        mocks.getContext.mockImplementation(() => context);
        context.measureText.mockImplementation(() => ({ width: 10 }));

        render(
            <div
                data-testid="wrapper"
                style={{ fontFamily: "sans-serif", fontSize: "1rem", fontWeight: "500" }}
            />,
        );

        const div = screen.getByTestId("wrapper");

        const result = getTextWidth(div, "1234");
        expect(result).toBe(10);

        expect(context.font).toBe("500 1rem sans-serif");

        expect(context.measureText).toHaveBeenCalledTimes(1);
        expect(context.measureText).toHaveBeenCalledWith("1234");
    });
});
