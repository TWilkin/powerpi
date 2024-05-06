import { act, render } from "../../test-setup";
import Floorplan from "./Floorplan";

describe("Floorplan", () => {
    beforeEach(() => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,

                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    test("renders", async () => {
        const { container } = await act(() =>
            render(
                <Floorplan
                    floorplan={{
                        floors: [
                            {
                                name: "Basement",
                                rooms: [
                                    {
                                        name: "Basement",
                                        width: 100,
                                        height: 100,
                                    },
                                ],
                            },
                            {
                                name: "Ground",
                                display_name: "Neverland",
                                rooms: [
                                    {
                                        name: "LivingRoom",
                                        display_name: "Living Room",
                                        points: [
                                            { x: 0, y: 0 },
                                            { x: 50, y: 0 },
                                            { x: 50, y: 100 },
                                            { x: 0, y: 100 },
                                        ],
                                    },
                                    {
                                        name: "Kitchen",
                                        points: [
                                            { x: 50, y: 0 },
                                            { x: 100, y: 0 },
                                            { x: 100, y: 100 },
                                            { x: 50, y: 100 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }}
                />,
            ),
        );

        expect(container).toMatchSnapshot();
    });
});
