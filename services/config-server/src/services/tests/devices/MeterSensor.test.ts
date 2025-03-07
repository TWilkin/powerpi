import commonSensorTests from "./commonSensorTests.js";

describe("Meter Sensor", () => {
    const { testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "meter",
                name: "Sensor",
                metrics: { electricity: "visible", gas: "read" },
                location: "Hallway",
            },
        ],
    });

    describe("Metrics", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "meter",
                        name: "Sensor",
                        location: "Hallway",
                    },
                ],
            }));

        test("Empty", () =>
            testInvalid({
                sensors: [
                    {
                        type: "meter",
                        name: "Sensor",
                        location: "Hallway",
                        metrics: {},
                    },
                ],
            }));

        test("Incorrect", () =>
            testInvalid({
                sensors: [
                    {
                        type: "meter",
                        name: "Sensor",
                        location: "Hallway",
                        metrics: {
                            something: "visible",
                        },
                    },
                ],
            }));

        test("Incorrect value", () =>
            testInvalid({
                sensors: [
                    {
                        type: "meter",
                        name: "Sensor",
                        location: "Hallway",
                        metrics: {
                            electricity: "nope",
                        },
                    },
                ],
            }));
    });
});
