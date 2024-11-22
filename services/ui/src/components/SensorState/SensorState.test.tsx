import { render, screen } from "@testing-library/react";
import SensorState from "./SensorState";

describe("SensorState", () => {
    const cases: { state: string | undefined; expected: string }[] = [
        { state: "detected", expected: "detected" },
        { state: "undetected", expected: "undetected" },
        { state: "open", expected: "open" },
        { state: "close", expected: "close" },
        { state: "something", expected: "something" },
        { state: undefined, expected: "" },
    ];
    test.each(cases)("$state => $expected", ({ state, expected }) => {
        render(
            <div data-testid="wrapper">
                <SensorState state={state} />
            </div>,
        );

        const wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveTextContent(expected);
    });
});
