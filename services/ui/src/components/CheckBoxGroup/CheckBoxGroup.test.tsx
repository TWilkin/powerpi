import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CheckBoxGroup from "./CheckBoxGroup";

describe("CheckBoxGroup", () => {
    const options = [
        { label: "Option 1", value: 1 },
        { label: "Option 2", value: 2 },
    ];

    test("renders", () => {
        render(<CheckBoxGroup options={options} selections={[]} onChange={vi.fn()} />);

        expect(screen.getAllByRole("checkbox")).toHaveLength(options.length + 1);

        const all = screen.getByLabelText("All");
        expect(all).toBeInTheDocument();
        expect(all).not.toBeChecked();
        expect(all).toHaveProperty("indeterminate", false);

        const option1 = screen.getByLabelText("Option 1");
        expect(option1).toBeInTheDocument();
        expect(option1).not.toBeChecked();

        const option2 = screen.getByLabelText("Option 2");
        expect(option2).toBeInTheDocument();
        expect(option2).not.toBeChecked();
    });

    const selections: {
        selections: number[];
        indeterminate?: boolean;
        all?: boolean;
        option1?: boolean;
        option2?: boolean;
    }[] = [
        { selections: [] },
        { selections: [1, 2], all: true, option1: true, option2: true },
        { selections: [2], indeterminate: true, all: false, option1: false, option2: true },
    ];
    test.each(selections)(
        "shows selection $selections",
        ({ selections, indeterminate = false, all = false, option1 = false, option2 = false }) => {
            render(<CheckBoxGroup options={options} selections={selections} onChange={vi.fn()} />);

            function check(label: string, checked: boolean, indeterminate = false) {
                const checkbox = screen.getByLabelText(label);
                expect(checkbox).toBeInTheDocument();

                if (checked) {
                    expect(checkbox).toBeChecked();
                } else {
                    expect(checkbox).not.toBeChecked();
                }

                expect(checkbox).toHaveProperty("indeterminate", indeterminate);
            }

            check("All", all, indeterminate);
            check("Option 1", option1);
            check("Option 2", option2);
        },
    );

    const allChange: { selections: number[]; expected: number[] }[] = [
        { selections: [], expected: [1, 2] },
        { selections: [1, 2], expected: [] },
        { selections: [2], expected: [1, 2] },
    ];
    test.each(allChange)(
        "onChange all $selections -> $expected",
        async ({ selections, expected }) => {
            const onChange = vi.fn();

            render(<CheckBoxGroup options={options} selections={selections} onChange={onChange} />);

            const all = screen.getByLabelText("All");
            expect(all).toBeInTheDocument();

            await userEvent.click(all);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(expected);
        },
    );

    const selectionChange: { selections: number[]; expected: number[] }[] = [
        { selections: [], expected: [2] },
        { selections: [2], expected: [] },
        { selections: [1], expected: [1, 2] },
        { selections: [1, 2], expected: [1] },
    ];
    test.each(selectionChange)(
        "onChange selection $selections -> $expected",
        async ({ selections, expected }) => {
            const onChange = vi.fn();

            render(<CheckBoxGroup options={options} selections={selections} onChange={onChange} />);

            const option2 = screen.getByLabelText("Option 2");
            expect(option2).toBeInTheDocument();

            await userEvent.click(option2);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith(expected);
        },
    );
});
