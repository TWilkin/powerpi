import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { vi } from "vitest";
import Layout from "./Layout";

vi.mock("../../components/Header", () => ({ default: () => <header /> }));

describe("Layout", () => {
    test("renders", () => {
        render(
            <MemoryRouter initialEntries={["/test"]}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/test" element={<div data-testid="content" />} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );

        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();

        const main = screen.getByRole("main");
        expect(main).toBeInTheDocument();
        expect(within(main).getByTestId("content")).toBeInTheDocument();
    });
});
