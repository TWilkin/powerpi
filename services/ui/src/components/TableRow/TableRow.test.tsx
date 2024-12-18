import { render, screen, within } from "@testing-library/react";
import TableRow from "./TableRow";

describe("TableRow", () => {
    test("renders", () => {
        render(
            <table>
                <tbody>
                    <TableRow>
                        <td />
                    </TableRow>
                </tbody>
            </table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const row = within(table).getByRole("row");
        expect(row).toBeInTheDocument();
        expect(row).not.toHaveClass("sticky");

        expect(within(row).getByRole("cell")).toBeInTheDocument();
    });

    test("renders header", () => {
        render(
            <table>
                <thead>
                    <TableRow header>
                        <th />
                    </TableRow>
                </thead>
            </table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const row = within(table).getByRole("row");
        expect(row).toBeInTheDocument();
        expect(row).toHaveClass("sticky");

        expect(within(row).getByRole("columnheader")).toBeInTheDocument();
    });
});
