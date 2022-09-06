import commonDeviceTests from "./commonDeviceTests";

describe("Harmony Devices", () => {
    describe("Harmony Hub", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "harmony_hub", name: "Hub", ip: "127.0.0.1", port: 5222 }],
        });

        test("Good hostname", () =>
            testValid({
                devices: [{ type: "harmony_hub", name: "Hub", hostname: "hub.example.com" }],
            }));

        test("No hostname or IP", () =>
            testInvalid({
                devices: [{ type: "harmony_hub", name: "Hub" }],
            }));

        [-1, 254, "5222"].forEach((port) =>
            test(`Bad port ${port}`, () =>
                testInvalid({
                    devices: [{ type: "harmony_hub", name: "Hub", ip: "127.0.0.1", port }],
                }))
        );
    });

    describe("Harmony Activity", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "harmony_activity",
                    name: "Activity",
                    activity_name: "My Activity",
                    hub: "Hub",
                },
            ],
        });

        test("No hub", () =>
            testInvalid({
                devices: [
                    {
                        type: "harmony_activity",
                        name: "Activity",
                        activity_name: "My Activity",
                    },
                ],
            }));

        test("No activity_nmae", () =>
            testValid({
                devices: [
                    {
                        type: "harmony_activity",
                        name: "Activity",
                        hub: "Hub",
                    },
                ],
            }));
    });
});
