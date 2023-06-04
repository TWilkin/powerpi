import commonDeviceTests from "./commonDeviceTests";

describe("Network Devices", () => {
    describe("Computer", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "computer",
                    name: "Computer",
                    mac: "00:AA:BB:CC:DD:EE",
                    ip: "127.0.0.1",
                },
            ],
        });

        test("Good hostname", () =>
            testValid({
                devices: [
                    {
                        type: "computer",
                        name: "Computer",
                        mac: "00:AA:BB:CC:DD:EE",
                        hostname: "computer.example.com",
                    },
                ],
            }));

        test("No MAC Address", () =>
            testInvalid({
                devices: [
                    {
                        type: "computer",
                        name: "Computer",
                        ip: "127.0.0.1",
                    },
                ],
            }));

        ["test", "192.168.1.256"].forEach((ip) =>
            test(`Bad IP ${ip}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "computer",
                            name: "Computer",
                            mac: "00:AA:BB:CC:DD:EE",
                            ip,
                        },
                    ],
                }))
        );

        ["test", "00:11:22:33:44:55:66", "00:11:22:33:44:GG"].forEach((mac) =>
            test(`Bad MAC ${mac}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "computer",
                            name: "Computer",
                            mac,
                            hostname: "computer.example.com",
                        },
                    ],
                }))
        );

        test("No hostname or IP", () =>
            testInvalid({
                devices: [
                    {
                        type: "computer",
                        name: "Computer",
                        mac: "00:AA:BB:CC:DD:EE",
                    },
                ],
            }));
    });
});
