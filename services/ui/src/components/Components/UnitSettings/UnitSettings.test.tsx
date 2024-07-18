import { render, screen } from "@testing-library/react";
import UnitSettings from "./UnitSettings";

describe("UnitSettings", () => {
    test("renders units", () => {
        render(<UnitSettings />);

        expect(screen.getByText(/Gas:/)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Kilowatt Hours (kWh)" })).toBeInTheDocument();

        expect(screen.getByText(/Temperature:/)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Kelvin (K)" })).toBeInTheDocument();
    });
});
