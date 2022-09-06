import commonDeviceTests from "./commonDeviceTests";

describe("Macro Devices", () => {
    describe("Composite", () => {
        const { testInvalid } = commonDeviceTests({
            devices: [{ type: "composite", name: "Composite", devices: ["Device1", "Device2"] }],
        });

        [[], undefined, [1]].forEach((devices) =>
            test(`Bad devices ${devices}`, () =>
                testInvalid({
                    devices: [{ type: "composite", name: "Composite", devices }],
                }))
        );
    });

    describe("Delay", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "delay", name: "Delay", start: 10, end: 11 }],
        });

        test("No start or end", () =>
            testInvalid({
                devices: [{ type: "delay", name: "Delay" }],
            }));

        test("Good start", () =>
            testValid({
                devices: [{ type: "delay", name: "Delay", start: 1 }],
            }));

        test("Good end", () =>
            testValid({
                devices: [{ type: "delay", name: "Delay", end: 1 }],
            }));
    });

    describe("Log", () => {
        const { testInvalid } = commonDeviceTests({
            devices: [{ type: "log", name: "Log", message: "Test" }],
        });

        test("No message", () =>
            testInvalid({
                devices: [{ type: "log", name: "Log" }],
            }));
    });

    describe("Mutex", () => {
        const { testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "mutex",
                    name: "Mutex",
                    on_devices: ["Device1", "Device2"],
                    off_devices: ["Device3", "Device4"],
                },
            ],
        });

        [[], undefined, [1]].forEach((devices) =>
            ["on_devices", "off_devices"].forEach((prop) =>
                test(`Bad ${prop} ${devices}`, () =>
                    testInvalid({
                        devices: [
                            {
                                type: "mutex",
                                name: "Mutex",
                                on_devices: ["Device1", "Device2"],
                                off_devices: ["Device3", "Device4"],
                                [prop]: devices,
                            },
                        ],
                    }))
            )
        );
    });

    describe("Variable", () => {
        commonDeviceTests({
            devices: [{ type: "variable", name: "Variable" }],
        });
    });
});
