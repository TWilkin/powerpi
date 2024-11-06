import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Search from "./Search";

describe("Search", () => {
    test("renders", () => {
        render(<Search onSearch={vi.fn()} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "magnifying-glass");
    });

    test("onChange onSearch", async () => {
        const onChange = vi.fn();
        const onSearch = vi.fn();
        render(<Search onChange={onChange} onSearch={onSearch} />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();
        await userEvent.type(search, "search");

        expect(onChange).toHaveBeenCalled();
        expect(onSearch).toHaveBeenCalledWith("search");
    });
});
