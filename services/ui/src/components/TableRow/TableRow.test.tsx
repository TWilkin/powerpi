import { render, screen, within } from "@testing-library/react";
import TableRow from "./TableRow";

describe("TableRow", () => {
    const rows: [number, boolean][] = [
        [0, false],
        [1, true],
        [2, false],
    ];
    test.each(rows)("renders index=%i", (index, zebra) => {
        render(
            <table>
                <tbody>
                    <TableRow index={index}>
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
        expect(row).toHaveClass(zebra ? "bg-bg-zebra" : "bg-transparent");

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
