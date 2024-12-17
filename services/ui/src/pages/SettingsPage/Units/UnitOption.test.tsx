import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import UnitOption from "./UnitOption";

describe("UnitOption", () => {
    test("renders", async () => {
        render(<UnitOption type="temperature" value="K" dispatch={vi.fn()} />);

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        await userEvent.click(select);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);

        expect(options[0]).toHaveTextContent("Celsius (°C)");
        expect(options[1]).toHaveTextContent("Fahrenheit (F)");
        expect(options[2]).toHaveTextContent("Kelvin (K)");
    });

    test("updates", async () => {
        const dispatch = vi.fn();
        render(<UnitOption type="temperature" value="K" dispatch={dispatch} />);

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        await userEvent.click(select);

        const options = screen.getAllByRole("option");

        expect(options[0]).toHaveAttribute("aria-selected", "false");
        expect(options[1]).toHaveAttribute("aria-selected", "false");
        expect(options[2]).toHaveAttribute("aria-selected", "true");

        await userEvent.click(options[1]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: "Unit",
            unitType: "temperature",
            unit: "F",
        });
    });
});
