import { render, screen, within } from "@testing-library/react";
import Panel from "./Panel";

describe("Panel", () => {
    test("renders", () => {
        render(
            <Panel>
                <div data-testid="content" />
            </Panel>,
        );

        const panel = screen.getByRole("complementary");
        expect(panel).toBeInTheDocument();

        const content = within(panel).getByTestId("content");
        expect(content).toBeInTheDocument();
    });
});
