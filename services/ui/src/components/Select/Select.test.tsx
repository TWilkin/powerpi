import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Select from "./Select";
import { OptionType } from "./types";

describe("Select", () => {
    const exampleOptions: OptionType<number>[] = [
        { label: "Second", icon: "streamSpotify", value: 2 },
        { label: "Third", icon: "streamOther", value: 3 },
        { label: "First", icon: "streamRadio", value: 1 },
    ];

    test("renders", async () => {
        render(
            <Select
                options={exampleOptions}
                label="A select"
                value={undefined}
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole("combobox", { name: "A select" });
        expect(select).toBeInTheDocument();

        expect(screen.queryByRole("option")).not.toBeInTheDocument();

        const dropdownIcon = screen.getByRole("img", { hidden: true });
        expect(dropdownIcon).toBeInTheDocument();
        expect(dropdownIcon).toHaveAttribute("data-icon", "chevron-down");

        await userEvent.click(select);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);

        function checkOption(option: HTMLElement, text: string, icon: string) {
            expect(option).toHaveTextContent(text);

            const img = within(option).getByRole("img", { hidden: true });
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("data-icon", icon);
        }

        checkOption(options[0], "First", "radio");
        checkOption(options[1], "Second", "spotify");
        checkOption(options[2], "Third", "music");

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons[0]).toHaveAttribute("data-icon", "chevron-up");
    });

    test("selects value", async () => {
        render(<Select options={exampleOptions} label="A select" value={2} onChange={vi.fn()} />);

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        expect(screen.getByText("Second")).toBeInTheDocument();

        await userEvent.click(select);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);

        expect(options[0]).toHaveAttribute("aria-selected", "false");
        expect(options[1]).toHaveAttribute("aria-selected", "true");
        expect(options[2]).toHaveAttribute("aria-selected", "false");
    });

    test("handles change", async () => {
        const onChange = vi.fn();
        render(
            <Select
                options={exampleOptions}
                label="A select"
                value={undefined}
                onChange={onChange}
            />,
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        await userEvent.type(select, "c");

        const option = screen.getByRole("option");
        expect(option).toBeInTheDocument();
        expect(option).toHaveTextContent("Second");

        await userEvent.click(option);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(2);
    });

    test("loading", () => {
        render(
            <Select
                options={exampleOptions}
                label="A select"
                value={undefined}
                loading
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole("combobox", { name: "A select" });
        expect(select).toBeInTheDocument();

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);
        expect(icons[0]).toHaveAttribute("data-icon", "spinner");
    });
});
