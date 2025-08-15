import { Floorplan } from "@powerpi/common-api";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import HomePage from "./HomePage";

const mocks = vi.hoisted(() => ({
    useQueryFloorplan: vi.fn(),
    useFloor: vi.fn(),
}));

vi.mock("../../queries/useQueryFloorPlan", () => ({ default: mocks.useQueryFloorplan }));
vi.mock("./useFloor", () => ({ default: mocks.useFloor }));
vi.mock("./Floorplan", () => ({ default: () => <div data-testid="floorplan" /> }));

describe("HomePage", () => {
    const floorplan: Floorplan = {
        floors: [
            {
                name: "Ground",
                rooms: [
                    {
                        name: "LivingRoom",
                        display_name: "Living Room",
                        width: 100,
                        height: 100,
                    },
                    { name: "Kitchen", width: 100, height: 100, x: 100 },
                ],
            },
            {
                name: "FirstFloor",
                display_name: "First Floor",
                rooms: [
                    {
                        name: "MasterBedroom",
                        display_name: "Master Bedroom",
                        width: 200,
                        height: 100,
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        mocks.useQueryFloorplan.mockReturnValue({ data: floorplan });

        mocks.useFloor.mockReturnValue("Ground");
    });

    test("no floors", () => {
        mocks.useQueryFloorplan.mockReturnValue({ data: { floors: [] } });

        render(<HomePage />);

        expect(screen.getByText("No floor plan.")).toBeInTheDocument();
    });

    test("unknown floor", () => {
        mocks.useFloor.mockReturnValue("Basement");

        render(<HomePage />);

        expect(
            screen.getByText('Floor "Basement" is not present in the floor plan.'),
        ).toBeInTheDocument();
    });

    test("renders floorplan", () => {
        render(<HomePage />, {
            wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
        });

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(2);

        expect(links[0]).toHaveTextContent("Ground");
        expect(links[0]).toHaveProperty("href", "http://localhost:3000/home/Ground");

        expect(links[1]).toHaveTextContent("First Floor");
        expect(links[1]).toHaveProperty("href", "http://localhost:3000/home/FirstFloor");

        expect(screen.getByTestId("floorplan")).toBeInTheDocument();
    });
});
