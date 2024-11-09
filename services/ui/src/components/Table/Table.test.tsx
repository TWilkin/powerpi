import { render, screen, within } from "@testing-library/react";
import Table from "./Table";

describe("Table", () =>
    test("renders", () => {
        render(
            <Table>
                <tbody>
                    <tr>
                        <td>Cell</td>
                    </tr>
                </tbody>
            </Table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        expect(within(table).getByText("Cell")).toBeInTheDocument();
    }));
