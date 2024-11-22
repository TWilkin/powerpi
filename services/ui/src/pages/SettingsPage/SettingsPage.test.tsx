import { render, screen } from "@testing-library/react";
import SettingsPage from "./SettingsPage";

describe("SettingsPage", () => {
    test("renders", () => {
        render(<SettingsPage />);

        expect(screen.getByText("Units")).toBeInTheDocument();
        expect(screen.getByLabelText("Gas")).toBeInTheDocument();
        expect(screen.getByLabelText("Temperature")).toBeInTheDocument();
    });
});
