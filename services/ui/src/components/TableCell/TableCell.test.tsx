import { render, screen, within } from "@testing-library/react";
import { ComponentProps } from "react";
import TableCell from "./TableCell";

describe("TableCell", () => {
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
    });

    const width: { width?: ComponentProps<typeof TableCell>["width"]; expected: string }[] = [
        { width: "icon", expected: "w-8" },
        { width: "full", expected: "w-full" },
        { expected: "w-full" },
    ];
    test.each(width)("width=$width expected $expected", ({ width, expected }) => {
        render(
            <table>
                <tbody>
                    <tr>
                        <TableCell width={width}>Cell</TableCell>
                    </tr>
                </tbody>
            </table>,
        );

        const cell = screen.getByRole("cell");
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveClass(expected);
    });
});
