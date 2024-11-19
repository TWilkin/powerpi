import { render, screen, within } from "@testing-library/react";
import TableRow from "./TableRow";

describe("TableRow", () => {
    test("renders", () => {
        render(
            <table>
                <tbody>
                    <TableRow data-testid="row">
                        <td>Cell</td>
                    </TableRow>
                </tbody>
            </table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const row = within(table).getByTestId("row");
        expect(row).toBeInTheDocument();

        expect(within(row).getByText("Cell")).toBeInTheDocument();
    });
});
