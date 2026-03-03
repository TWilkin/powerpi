import { render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import PortalHost from "./PortalHost";
import usePortalHost from "./usePortalHost";

const TestChild = () => {
    const { dropdownHost, tooltipHost, getElementByHostId } = usePortalHost();

    return (
        <div>
            <span data-testid="child">Test Content</span>
            {createPortal(
                <div data-testid="dropdown-content">Dropdown Content</div>,
                getElementByHostId(dropdownHost),
            )}
            {createPortal(
                <div data-testid="tooltip-content">Tooltip Content</div>,
                getElementByHostId(tooltipHost),
            )}
        </div>
    );
};

describe("PortalHost", () => {
    test("renders children", () => {
        render(
            <PortalHost>
                <div data-testid="test-child">Test Child</div>
            </PortalHost>,
        );

        expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    test("creates dropdown and tooltip host containers for portaled content", () => {
        render(
            <PortalHost>
                <TestChild />
            </PortalHost>,
        );

        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
        expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
    });

    test("supports nested PortalHost components", () => {
        render(
            <PortalHost>
                <PortalHost>
                    <TestChild />
                </PortalHost>
            </PortalHost>,
        );

        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
        expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
    });
});
