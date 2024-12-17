import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Search from "./Search";

describe("Search", () => {
    test("renders", () => {
        render(<Search value="" onSearch={vi.fn()} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();

        const icon = screen.getAllByRole("img", { hidden: true });
        expect(icon).toHaveLength(2);
        expect(icon[0]).toBeInTheDocument();
        expect(icon[0]).toHaveAttribute("data-icon", "magnifying-glass");

        const clear = screen.getByLabelText("Clear search");
        expect(clear).toBeInTheDocument();
        expect(clear).toBeDisabled();
        expect(within(clear).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "xmark",
        );
    });

    test("onSearch", async () => {
        const onSearch = vi.fn();
        render(<Search value="" onSearch={onSearch} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();
        await userEvent.type(search, "s");

        expect(onSearch).toHaveBeenCalledWith("s");
    });

    test("clear", async () => {
        const onSearch = vi.fn();
        render(<Search value="something" onSearch={onSearch} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();
        expect(search).toHaveValue("something");

        vi.resetAllMocks();

        const clear = screen.getByLabelText("Clear search");
        expect(clear).toBeInTheDocument();
        expect(clear).toBeEnabled();

        await userEvent.click(clear);

        expect(onSearch).toHaveBeenCalledWith("");
    });
});
