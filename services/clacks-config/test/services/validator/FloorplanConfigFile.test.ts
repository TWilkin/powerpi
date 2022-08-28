import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    setupValidator,
    testInvalid as _testInvalid,
    testValid as _testValid,
} from "./setupValidator";

describe("Floorplan", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Floorplan, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Floorplan, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ floorplan: {} }));

    test("Valid file", () =>
        testValid({
            floorplan: {
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
            },
        }));

    test("Other properties", () => testInvalid({ floorplan: { something: "else" } }));

    describe("Floorplan", () => {
        test("No floors", () => testInvalid({ floorplan: { floors: [] } }));

        test("No floor name", () => testInvalid({ floorplan: { floors: [{}] } }));
    });

    describe("Floor", () => {
        test("Other properties", () =>
            testInvalid({ floorplan: { floors: [{ name: "Basement", something: "else " }] } }));

        test("No rooms", () => testInvalid({ floorplan: { floors: [{ name: "Basement" }] } }));

        test("No rooms list", () =>
            testInvalid({ floorplan: { floors: [{ name: "Basement", rooms: [] }] } }));
    });

    describe("Room", () => {
        test("No name", () =>
            testInvalid({ floorplan: { floors: [{ name: "Basement", rooms: [{}] }] } }));

        test("Other properties", () =>
            testInvalid({
                floorplan: {
                    floors: [
                        { name: "Basement", rooms: [{ name: "Basement", something: "else" }] },
                    ],
                },
            }));

        test("No dimensions", () =>
            testInvalid({
                floorplan: { floors: [{ name: "Basement", rooms: [{ name: "Basement" }] }] },
            }));

        ["x", "y", "width", "height"].forEach((prop) => {
            test(`${prop} type`, () => {
                testInvalid({
                    floorplan: {
                        floors: [
                            { name: "Basement", rooms: [{ name: "Basement", [prop]: "string" }] },
                        ],
                    },
                });
            });
        });

        test("No points", () =>
            testInvalid({
                floorplan: {
                    floors: [{ name: "Basement", rooms: [{ name: "Basement", points: [] }] }],
                },
            }));
    });

    describe("Points", () => {
        ["x", "y"].forEach((prop) => {
            test(`${prop} type`, () => {
                testInvalid({
                    floorplan: {
                        floors: [
                            {
                                name: "Basement",
                                rooms: [{ name: "Basement", points: { [prop]: "string" } }],
                            },
                        ],
                    },
                });
            });
        });
    });
});
