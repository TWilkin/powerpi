import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LanguageSettings from "./LanguageSettings";

const mocks = vi.hoisted(() => ({
    useUserSettings: vi.fn(),
}));

vi.mock("../../../hooks/useUserSettings", async () => ({
    default: mocks.useUserSettings,
}));

describe("LanguageSettings", () => {
    beforeEach(() =>
        mocks.useUserSettings.mockReturnValue({
            dispatch: vi.fn(),
        }),
    );

    test("renders", async () => {
        render(<LanguageSettings />);

        const group = screen.getByRole("group");
        expect(group).toBeInTheDocument();
        expect(group).toHaveAccessibleName("Language");

        const combobox = within(group).getByRole("combobox");
        expect(combobox).toBeInTheDocument();

        await userEvent.type(combobox, "english");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);

        expect(options[0]).toHaveAccessibleName("English (UK)");
        expect(options[1]).toHaveAccessibleName("English (US)");
    });

    test("changes", async () => {
        const dispatch = vi.fn();

        mocks.useUserSettings.mockReturnValue({
            dispatch,
        });

        render(<LanguageSettings />);

        const combobox = screen.getByRole("combobox");
        expect(combobox).toBeInTheDocument();

        await userEvent.type(combobox, "us");

        const option = screen.getByRole("option");
        expect(option).toBeInTheDocument();

        await userEvent.click(option);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: "Language",
            language: "en-US",
        });
    });
});
