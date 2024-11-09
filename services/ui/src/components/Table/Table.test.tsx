import { render, screen, within } from "@testing-library/react";
import Table from "./Table";

describe("Table", () => {
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
        expect(table).toHaveClass("m-auto");
        expect(table).not.toHaveClass("w-full");

        expect(within(table).getByText("Cell")).toBeInTheDocument();
    });

    test("grow", () => {
        render(
            <Table grow={false}>
                <tbody>
                    <tr>
                        <td>Cell</td>
                    </tr>
                </tbody>
            </Table>,
        );

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
        expect(table).not.toHaveClass("m-auto");
        expect(table).toHaveClass("w-full");
    });
});
