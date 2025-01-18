import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import HistoryPathFilter from "./HistoryPathFilter";

describe("HistoryPathFilter", () => {
    test("renders with options", async () => {
        const data = ["option1", "option2"];
        const onChange = vi.fn();

        render(
            <HistoryPathFilter
                path="types"
                value="option1"
                data={data}
                isFetching={false}
                onChange={onChange}
            />,
        );

        const label = screen.getByLabelText("Types");
        expect(label).toBeInTheDocument();

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        await userEvent.click(select);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("option1");
        expect(options[0]).toHaveAttribute("aria-selected", "true");

        const option = options[1];
        expect(option).toHaveTextContent("option2");
        expect(option).toHaveAttribute("aria-selected", "false");

        await userEvent.click(option);
        expect(onChange).toHaveBeenCalledWith("option2");
    });

    test("renders loading state", () => {
        render(
            <HistoryPathFilter
                path="entities"
                value=""
                data={undefined}
                isFetching
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        const icons = screen.getAllByRole("img", { hidden: true });
        const loading = icons.find((icon) => icon.getAttribute("data-icon") === "spinner");
        expect(loading).toBeInTheDocument();
    });
});
