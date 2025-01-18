import { render, screen, within } from "@testing-library/react";
import LoaderRow from "./LoaderRow";

describe("LoaderRow", () => {
    test("renders", () => {
        render(
            <table>
                <tbody>
                    <LoaderRow index={0} />
                </tbody>
            </table>,
        );

        const row = screen.getByRole("row");
        expect(row).toBeInTheDocument();

        const cell = within(row).getByRole("cell");
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveAttribute("colspan", "5");

        const loader = within(cell).getByRole("alert");
        expect(loader).toBeInTheDocument();
    });
});
