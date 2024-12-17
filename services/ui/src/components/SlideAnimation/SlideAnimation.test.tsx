import { render, screen, within } from "@testing-library/react";
import SlideAnimation from "./SlideAnimation";

describe("SlideAnimation", () => {
    test("renders", () => {
        render(
            <SlideAnimation open data-testid="wrapper">
                <div data-testid="content" />
            </SlideAnimation>,
        );

        const wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toBeInTheDocument();

        const content = within(wrapper).getByTestId("content");
        expect(content).toBeInTheDocument();
    });

    test("closed", () => {
        render(
            <SlideAnimation open={false} data-testid="wrapper">
                <div data-testid="content" />
            </SlideAnimation>,
        );

        const wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toBeInTheDocument();

        const content = screen.queryByTestId("content");
        expect(content).not.toBeInTheDocument();
    });

    test("open -> close", () => {
        const { rerender } = render(
            <SlideAnimation open data-testid="wrapper">
                <div data-testid="content" />
            </SlideAnimation>,
        );

        let wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toBeInTheDocument();

        expect(screen.getByTestId("content")).toBeInTheDocument();

        // close
        rerender(
            <SlideAnimation open={false} data-testid="wrapper">
                <div data-testid="content" />
            </SlideAnimation>,
        );

        wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toBeInTheDocument();

        // it's still in the document until after the animation
        // after the animation, it'll be hidden, but not sure how to test this
        expect(screen.getByTestId("content")).toBeInTheDocument();
    });
});
