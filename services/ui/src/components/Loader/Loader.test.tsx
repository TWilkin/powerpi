import { render, screen, within } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
    test("renders", () => {
        render(<Loader />);

        const wrapper = screen.getByLabelText("Loading");
        expect(wrapper).toBeInTheDocument();

        const loader = within(wrapper).getByRole("img", { hidden: true });
        expect(loader).toBeInTheDocument();
        expect(loader).toHaveAttribute("data-icon", "spinner");
    });
});
