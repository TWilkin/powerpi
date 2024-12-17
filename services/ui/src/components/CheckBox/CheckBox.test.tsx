import { render, screen } from "@testing-library/react";
import CheckBox from "./CheckBox";

describe("CheckBox", () => {
    test("renders", () => {
        render(<CheckBox label="Label" />);

        const checkbox = screen.getByLabelText("Label");
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
        expect(checkbox).toHaveProperty("indeterminate", false);
    });

    test("checked", () => {
        render(<CheckBox label="Label" checked />);

        const checkbox = screen.getByLabelText("Label");
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
        expect(checkbox).toHaveProperty("indeterminate", false);
    });

    test("indeterminate", () => {
        render(<CheckBox label="Label" indeterminate />);

        const checkbox = screen.getByLabelText("Label");
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
        expect(checkbox).toHaveProperty("indeterminate", true);
    });
});
