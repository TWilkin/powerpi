import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import OptionalRoute from "./OptionalRoute";

vi.mock("react-router-dom", async () => ({
    ...(await vi.importActual("react-router-dom")),
    Navigate: () => <div>Disabled</div>,
}));

const mocks = vi.hoisted(() => ({
    useOptionalRoute: vi.fn(),
}));

vi.mock("./useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

type WrapperProps = PropsWithChildren<{
    route: string;
}>;

const Wrapper = ({ children, route }: WrapperProps) => (
    <MemoryRouter initialEntries={[`/${route}`]}>
        <Routes>
            <Route path="/" element={children}>
                <Route path={route} element={<div>Enabled</div>} />
            </Route>
        </Routes>
    </MemoryRouter>
);

describe("OptionalRoute", () => {
    afterEach(() => vi.clearAllMocks());

    test("does nothing while loading", () => {
        mocks.useOptionalRoute.mockReturnValue(undefined);

        render(
            <Wrapper route="home">
                <OptionalRoute />
            </Wrapper>,
        );

        expect(screen.queryByText("Enabled")).not.toBeInTheDocument();
        expect(screen.queryByText("Disabled")).not.toBeInTheDocument();
    });

    const routes = ["home", "device"];

    test.each(routes)("redirects when %s disabled", (route) => {
        mocks.useOptionalRoute.mockReturnValue({ home: true, device: true, [route]: false });

        render(
            <Wrapper route={route}>
                <OptionalRoute />
            </Wrapper>,
        );

        expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    test.each(routes)("shows element when %s enabled", (route) => {
        mocks.useOptionalRoute.mockReturnValue({ home: false, device: false, [route]: true });

        render(
            <Wrapper route={route}>
                <OptionalRoute />
            </Wrapper>,
        );

        expect(screen.getByText("Enabled")).toBeInTheDocument();
    });
});
