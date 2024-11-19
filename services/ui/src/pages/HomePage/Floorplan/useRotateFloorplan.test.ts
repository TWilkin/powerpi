import { renderHook } from "@testing-library/react";
import useRotateFloorplan from "./useRotateFloorplan";

const floorplan = {
    floors: [
        {
            name: "Basement",
            rooms: [
                {
                    name: "Basement",
                    width: 200,
                    height: 100,
                },
            ],
        },
        {
            name: "Ground",
            rooms: [
                {
                    name: "LivingRoom",
                    display_name: "Living Room",
                    points: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 },
                        { x: 0, y: 100 },
                    ],
                },
                {
                    name: "Kitchen",
                    points: [
                        { x: 100, y: 0 },
                        { x: 200, y: 0 },
                        { x: 200, y: 100 },
                        { x: 100, y: 100 },
                    ],
                },
            ],
        },
    ],
};

describe("useRotateFloorplan", () => {
    test("no rotation", () => {
        const { result } = renderHook(() => useRotateFloorplan(floorplan, false));

        expect(result.current).toBeDefined();

        expect(result.current.floorplan).toStrictEqual(floorplan);

        expect(result.current.viewBox).toBeDefined();
        expect(result.current.viewBox.minX).toBe(0);
        expect(result.current.viewBox.maxX).toBe(200);
        expect(result.current.viewBox.minY).toBe(0);
        expect(result.current.viewBox.maxY).toBe(100);
    });

    test("rotation", () => {
        const { result } = renderHook(() => useRotateFloorplan(floorplan, true));

        expect(result.current).toBeDefined();

        expect(result.current.floorplan).toBeDefined();
        expect(result.current.floorplan.floors).toHaveLength(2);

        expect(result.current.floorplan.floors[0].name).toBe("Basement");
        expect(result.current.floorplan.floors[0].rooms).toHaveLength(1);
        expect(result.current.floorplan.floors[0].rooms[0].x).toBeCloseTo(0);
        expect(result.current.floorplan.floors[0].rooms[0].y).toBeCloseTo(0);
        expect(result.current.floorplan.floors[0].rooms[0]).toHaveProperty("width", 100);
        expect(result.current.floorplan.floors[0].rooms[0]).toHaveProperty("height", 200);

        expect(result.current.floorplan.floors[1].name).toBe("Ground");
        expect(result.current.floorplan.floors[1].rooms).toHaveLength(2);
        expect(result.current.floorplan.floors[1].rooms[0].name).toBe("LivingRoom");
        expect(result.current.floorplan.floors[1].rooms[0].x).toBeCloseTo(0);
        expect(result.current.floorplan.floors[1].rooms[0].y).toBeCloseTo(0);
        expect(result.current.floorplan.floors[1].rooms[0]).toHaveProperty("width", 100);
        expect(result.current.floorplan.floors[1].rooms[0]).toHaveProperty("height", 100);
        expect(result.current.floorplan.floors[1].rooms[1].name).toBe("Kitchen");
        expect(result.current.floorplan.floors[1].rooms[1].x).toBeCloseTo(0);
        expect(result.current.floorplan.floors[1].rooms[1].y).toBeCloseTo(100);
        expect(result.current.floorplan.floors[1].rooms[1]).toHaveProperty("width", 100);
        expect(result.current.floorplan.floors[1].rooms[1]).toHaveProperty("height", 100);

        expect(result.current.viewBox).toBeDefined();
        expect(result.current.viewBox.minX).toBe(0);
        expect(result.current.viewBox.maxX).toBe(100);
        expect(result.current.viewBox.minY).toBe(0);
        expect(result.current.viewBox.maxY).toBe(200);
    });
});
