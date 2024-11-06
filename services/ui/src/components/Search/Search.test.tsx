import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Search from "./Search";

describe("Search", () => {
    test("renders", () => {
        render(<Search onSearch={vi.fn()} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();

        const icon = screen.getAllByRole("img", { hidden: true });
        expect(icon).toHaveLength(2);
        expect(icon[0]).toBeInTheDocument();
        expect(icon[0]).toHaveAttribute("data-icon", "magnifying-glass");

        const clear = screen.getByLabelText("Clear search");
        expect(clear).toBeInTheDocument();
        expect(within(clear).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "xmark",
        );
    });

    test("onSearch", async () => {
        const onSearch = vi.fn();
        render(<Search onSearch={onSearch} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();
        await userEvent.type(search, "search");

        expect(onSearch).toHaveBeenCalledWith("search");
    });

    test("clear", async () => {
        const onSearch = vi.fn();
        render(<Search onSearch={onSearch} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();
        await userEvent.type(search, "s");

        vi.resetAllMocks();

        const clear = screen.getByLabelText("Clear search");
        expect(clear).toBeInTheDocument();

        await userEvent.click(clear);

        expect(onSearch).toHaveBeenCalledWith("");
    });
});
