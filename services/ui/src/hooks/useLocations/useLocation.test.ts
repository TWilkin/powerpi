import { Floorplan } from "@powerpi/common-api";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useLocations from "./useLocations";

const mocks = vi.hoisted(() => ({
    useQueryFloorplan: vi.fn(),
    useOptionalRoute: vi.fn(),
}));

vi.mock("../../queries/useQueryFloorPlan", () => ({ default: mocks.useQueryFloorplan }));
vi.mock("../../routing/useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

describe("useLocations", () => {
    const floorplan: Floorplan = {
        floors: [
            {
                name: "Ground",
                rooms: [
                    {
                        name: "LivingRoom",
                        display_name: "Living Room",
                    },
                    { name: "Kitchen" },
                ],
            },
            {
                name: "First",
                rooms: [
                    {
                        name: "MasterBedroom",
                        display_name: "Master Bedroom",
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        mocks.useQueryFloorplan.mockImplementation((enabled) => {
            if (enabled) {
                return { data: floorplan };
            }

            return { data: undefined };
        });
    });

    test("disabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: false });

        const { result } = renderHook(useLocations);

        expect(result.current).toStrictEqual([]);
    });

    test("enabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: true });

        const { result } = renderHook(useLocations);

        expect(result.current).toStrictEqual([
            { name: "LivingRoom", display_name: "Living Room" },
            { name: "Kitchen" },
            { name: "MasterBedroom", display_name: "Master Bedroom" },
        ]);
    });
});
