import commonSensorTests from "./commonSensorTests.js";

describe("PowerPi Sensor", () => {
    const { testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "powerpi",
                name: "Sensor",
                metrics: { humidity: "visible", motion: "read", temperature: "none" },
                location: "Hallway",
                poll_delay: 60,
                dht22: {
                    skip: 10,
                },
                pir: {
                    init_delay: 1,
                    post_detect_skip: 2,
                    post_motion_check: 3,
                },
            },
        ],
    });

    describe("Metrics", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "powerpi",
                        name: "Sensor",
                        location: "Hallway",
                    },
                ],
            }));

        test("Empty", () =>
            testInvalid({
                sensors: [
                    {
                        type: "powerpi",
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
                        type: "powerpi",
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
                        type: "powerpi",
                        name: "Sensor",
                        location: "Hallway",
                        metrics: {
                            temperature: "nope",
                        },
                    },
                ],
            }));
    });
});
