import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import useOnClickOutside from "./useOnClickOutside";

const TestComponent = ({ onClickOutside }: { onClickOutside: () => void }) => {
    const ref = useOnClickOutside<HTMLDivElement>(onClickOutside);

    return (
        <div>
            <div ref={ref} data-testid="target">
                <button data-testid="inside-button">Inside</button>
            </div>
            <button data-testid="outside-button">Outside</button>
        </div>
    );
};

describe("useOnClickOutside", () => {
    const user = userEvent.setup();
    let mockHandler: ReturnType<typeof vi.fn>;

    beforeEach(() => (mockHandler = vi.fn()));

    test("calls handler when clicking outside the element", async () => {
        render(<TestComponent onClickOutside={mockHandler} />);

        const outsideButton = screen.getByTestId("outside-button");
        expect(outsideButton).toBeInTheDocument();

        await user.click(outsideButton);

        expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    test("does not call handler when clicking inside the element", async () => {
        render(<TestComponent onClickOutside={mockHandler} />);

        const insideButton = screen.getByTestId("inside-button");
        expect(insideButton).toBeInTheDocument();

        await user.click(insideButton);

        expect(mockHandler).not.toHaveBeenCalled();
    });

    test("does not call handler when clicking on the target element itself", async () => {
        render(<TestComponent onClickOutside={mockHandler} />);

        const target = screen.getByTestId("target");
        expect(target).toBeInTheDocument();

        await user.click(target);

        expect(mockHandler).not.toHaveBeenCalled();
    });

    test("calls handler when clicking on document body", async () => {
        render(<TestComponent onClickOutside={mockHandler} />);

        await user.click(document.body);

        expect(mockHandler).toHaveBeenCalledTimes(1);
    });
});
