import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
    test("renders", () => {
        render(<Loader />);

        const loader = screen.getByRole("img", { hidden: true });
        expect(loader).toBeInTheDocument();
        expect(loader).toHaveAttribute("data-icon", "spinner");
    });
});
