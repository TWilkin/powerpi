import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UserSettingsContextType } from "../../../hooks/UserSettings/types";
import { UserSettingsContext } from "../../../hooks/UserSettings/UserSettingsContext";
import UnitOption from "./UnitOption";

describe("UnitOption", () => {
    test("renders options", () => {
        render(<UnitOption type="temperature" currentUnit="K" />);

        const options: HTMLOptionElement[] = screen.getAllByRole("option");
        expect(options).toHaveLength(3);

        expect(screen.getByRole("option", { name: "Celsius (°C)" })).toBeInTheDocument();
        expect(options[0]).toHaveValue("°C");

        expect(screen.getByRole("option", { name: "Fahrenheit (F)" })).toBeInTheDocument();
        expect(options[1]).toHaveValue("F");

        expect(screen.getByRole("option", { name: "Kelvin (K)" })).toBeInTheDocument();
        expect(options[2]).toHaveValue("K");
        expect(options[2].selected).toBe(true);
    });

    test("changes selection", async () => {
        const dispatch = jest.fn();

        const context: UserSettingsContextType = {
            settings: {
                units: {},
            },
            dispatch,
        };

        render(<UnitOption type="temperature" currentUnit="K" />, {
            wrapper: ({ children }) => (
                <UserSettingsContext.Provider value={context}>
                    {children}
                </UserSettingsContext.Provider>
            ),
        });

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        const option = screen.getByRole("option", { name: "Fahrenheit (F)" });
        expect(option).toBeInTheDocument();

        await userEvent.selectOptions(select, option);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            name: "UpdateUnit",
            type: "temperature",
            unit: "F",
        });
    });
});
