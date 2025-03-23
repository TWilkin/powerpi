import { render, screen, within } from "@testing-library/react";
import SettingsPage from "./SettingsPage";

describe("SettingsPage", () => {
    test("renders", () => {
        render(<SettingsPage />);

        const groups = screen.getAllByRole("group");
        expect(groups).toHaveLength(2);

        const languages = groups[0];
        expect(within(languages).getByText("Language")).toBeInTheDocument();
        expect(within(languages).getByLabelText("Language")).toBeInTheDocument();

        const units = groups[1];
        expect(within(units).getByText("Units")).toBeInTheDocument();
        expect(within(units).getByLabelText("Gas")).toBeInTheDocument();
        expect(within(units).getByLabelText("Temperature")).toBeInTheDocument();
    });
});
