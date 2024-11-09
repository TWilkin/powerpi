import { render, screen, within } from "@testing-library/react";
import TableCell from "./TableCell";

describe("TableCell", () =>
    test("renders", () => {
        render(
            <table>
                <tbody>
                    <tr>
                        <TableCell>Cell</TableCell>
                    </tr>
                </tbody>
            </table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        expect(within(table).getByText("Cell")).toBeInTheDocument();
    }));
