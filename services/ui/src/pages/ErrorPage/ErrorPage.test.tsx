import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import ErrorPage from "./ErrorPage";

const mocks = vi.hoisted(() => ({
    useRouteError: vi.fn(),
    isRouteErrorResponse: vi.fn(),
    isAxiosError: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        isRouteErrorResponse: mocks.isRouteErrorResponse,
        Navigate: ({ to }: { to: string }) => <>{to}</>,
        useRouteError: mocks.useRouteError,
    };
});

vi.mock("axios", () => ({ isAxiosError: mocks.isAxiosError }));

describe("ErrorPage", () => {
    test("unauthorised", () => {
        mocks.useRouteError.mockReturnValue({ status: 401, statusText: "Unauthorised" });
        mocks.isRouteErrorResponse.mockReturnValue(true);

        render(<ErrorPage />);

        expect(screen.getByText("login")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    const cases: {
        error: object | string | undefined;
        routeError?: boolean;
        axiosError?: boolean;
        expected: string;
    }[] = [
        {
            error: { status: 404, statusText: "Not found" },
            routeError: true,
            expected: "404 Not found",
        },
        {
            error: { response: { status: 404 }, message: "Not found" },
            axiosError: true,
            expected: "Not found",
        },
        {
            error: new Error("This is an Error"),
            expected: "This is an Error",
        },
        {
            error: "This is a string error",
            expected: "This is a string error",
        },
        {
            error: undefined,
            expected: "Unknown error",
        },
    ];
    test.each(cases)(
        "$error => $expected",
        ({ error, routeError = false, axiosError = false, expected }) => {
            mocks.useRouteError.mockReturnValue(error);
            mocks.isRouteErrorResponse.mockReturnValue(routeError);
            mocks.isAxiosError.mockReturnValue(axiosError);

            render(<ErrorPage />);

            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();

            const heading = within(alert).getByRole("heading");
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent("An unexpected error has occurred.");

            const message = within(alert).getByText(expected);
            expect(message).toBeInTheDocument();
        },
    );
});
