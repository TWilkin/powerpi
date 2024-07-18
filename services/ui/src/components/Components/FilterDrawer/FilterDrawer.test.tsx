import { faCog, faSliders } from "@fortawesome/free-solid-svg-icons";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterDrawer from "./FilterDrawer";

describe("FilterDrawer", () => {
    test("opens and closes", async () => {
        render(
            <div>
                <FilterDrawer
                    filters={[
                        { id: "filter-1", icon: faSliders, content: <div>Content 1</div> },
                        { id: "filter-2", icon: faCog, content: <div>Content 2</div> },
                    ]}
                />
                ,
                <div data-testid="outside" />
            </div>,
        );

        const button1 = screen.getByRole("button", { name: "filter-1" });
        expect(button1).toBeInTheDocument();
        expect(within(button1).getByRole("img", { hidden: true })).toBeInTheDocument();

        const drawer1 = screen.getByLabelText("drawer-filter-1");
        expect(drawer1).toBeInTheDocument();
        checkClosed(drawer1, true);
        expect(within(drawer1).getByText("Content 1")).toBeInTheDocument();

        const button2 = screen.getByRole("button", { name: "filter-2" });
        expect(button2).toBeInTheDocument();
        expect(within(button2).getByRole("img", { hidden: true })).toBeInTheDocument();

        const drawer2 = screen.getByLabelText("drawer-filter-2");
        expect(drawer2).toBeInTheDocument();
        checkClosed(drawer2, true);
        expect(within(drawer2).getByText("Content 2")).toBeInTheDocument();

        // first open drawer1
        await userEvent.click(button1);

        checkOpen(drawer1);
        checkClosed(drawer2, false);

        // then clicking on button2 will switch them
        await userEvent.click(button2);

        checkClosed(drawer1, false);
        checkOpen(drawer2);

        // clicking anywhere else will close it
        const outside = screen.getByTestId("outside");
        expect(outside).toBeInTheDocument();

        await userEvent.click(outside);

        checkClosed(drawer1, true);
        checkClosed(drawer2, true);

        // now open 2 again
        await userEvent.click(button2);

        checkClosed(drawer1, false);
        checkOpen(drawer2);

        // clicking button 2 will close it
        await userEvent.click(button2);

        checkClosed(drawer1, true);
        checkClosed(drawer1, true);
    });
});

function checkOpen(element: HTMLElement) {
    expect(element).toHaveClass("open");
    expect(element).not.toHaveClass("closed");
    expect(element).not.toHaveClass("all-closed");
}

function checkClosed(element: HTMLElement, allOpen: boolean) {
    expect(element).not.toHaveClass("open");
    expect(element).toHaveClass("closed");

    if (allOpen) {
        expect(element).toHaveClass("all-closed");
    } else {
        expect(element).not.toHaveClass("all-closed");
    }
}
