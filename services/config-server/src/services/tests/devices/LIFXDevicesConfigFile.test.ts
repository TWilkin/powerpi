import commonDeviceTests from "./commonDeviceTests.js";

describe("LIFX Devices", () => {
    describe("LIFX Light", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "lifx_light",
                    name: "Light",
                    mac: "00:AA:BB:CC:DD:EE",
                    ip: "127.0.0.1",
                    duration: 10,
                },
            ],
        });

        test("Good hostname", () =>
            testValid({
                devices: [
                    {
                        type: "lifx_light",
                        name: "Light",
                        mac: "00:AA:BB:CC:DD:EE",
                        hostname: "light.example.com",
                    },
                ],
            }));

        test("No MAC Address", () =>
            testInvalid({
                devices: [
                    {
                        type: "lifx_light",
                        name: "Light",
                        ip: "127.0.0.1",
                    },
                ],
            }));

        ["test", "192.168.1.256"].forEach((ip) =>
            test(`Bad IP ${ip}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "lifx_light",
                            name: "Light",
                            mac: "00:AA:BB:CC:DD:EE",
                            ip,
                        },
                    ],
                })),
        );

        ["test", "00:11:22:33:44:55:66", "00:11:22:33:44:GG"].forEach((mac) =>
            test(`Bad MAC ${mac}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "lifx_light",
                            name: "Light",
                            mac,
                            hostname: "light.example.com",
                        },
                    ],
                })),
        );

        test("No hostname or IP", () =>
            testInvalid({
                devices: [
                    {
                        type: "lifx_light",
                        name: "Light",
                        mac: "00:AA:BB:CC:DD:EE",
                    },
                ],
            }));

        [-1, "5"].forEach((duration) =>
            test(`Bad duration ${duration}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "lifx_light",
                            name: "Light",
                            mac: "00:AA:BB:CC:DD:EE",
                            hostname: "light.example.com",
                            duration,
                        },
                    ],
                })),
        );
    });
});
