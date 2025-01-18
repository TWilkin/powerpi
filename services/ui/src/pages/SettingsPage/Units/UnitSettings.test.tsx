import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import UnitSettings from "./UnitSettings";

const mocks = vi.hoisted(() => ({
    useUserSettings: vi.fn(),
}));

vi.mock("../../../hooks/useUserSettings", async () => ({
    default: mocks.useUserSettings,
}));

describe("UnitSettings", () => {
    beforeEach(() =>
        mocks.useUserSettings.mockReturnValue({
            settings: {
                units: {
                    temperature: "K",
                },
            },
            dispatch: vi.fn(),
        }),
    );

    test("renders", () => {
        render(<UnitSettings />);

        const group = screen.getByRole("group");
        expect(group).toBeInTheDocument();
        expect(group).toHaveAccessibleName("Units");

        const comboboxes = within(group).getAllByRole("combobox");
        expect(comboboxes).toHaveLength(4);

        expect(within(group).getByLabelText("Current")).toBeInTheDocument();
        expect(within(group).getByLabelText("Electrical Potential")).toBeInTheDocument();
        expect(within(group).getByLabelText("Gas")).toBeInTheDocument();
        expect(within(group).getByLabelText("Temperature")).toBeInTheDocument();
    });

    test("changes", async () => {
        const dispatch = vi.fn();

        mocks.useUserSettings.mockReturnValue({
            settings: {
                units: {
                    temperature: "K",
                },
            },
            dispatch,
        });

        render(<UnitSettings />);

        const temperature = screen.getByLabelText("Temperature");
        expect(temperature).toBeInTheDocument();

        await userEvent.type(temperature, "fahrenheit");

        const option = screen.getByRole("option");
        expect(option).toBeInTheDocument();

        await userEvent.click(option);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: "Unit",
            unitType: "temperature",
            unit: "F",
        });
    });
});
