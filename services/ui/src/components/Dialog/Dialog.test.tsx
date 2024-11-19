import { render, screen, within } from "@testing-library/react";
import Dialog from "./Dialog";

describe("Dialog", () => {
    test("renders", () => {
        render(
            <Dialog heading="My Dialog" icon={<div>My Icon</div>} open>
                My Content
            </Dialog>,
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();

        const icon = within(dialog).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "xmark");

        const heading = within(dialog).getByRole("heading");
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent("My Dialog");

        const closeButton = within(dialog).getByRole("button");
        expect(closeButton).toBeInTheDocument();

        expect(within(dialog).getByText("My Content")).toBeInTheDocument();
    });
});
