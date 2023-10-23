import commonDeviceTests from "./commonDeviceTests";

describe("Snapcast Devices", () => {
    describe("Client", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "snapcast_client",
                    name: "Client",
                    server: "Snapcast",
                    mac: "00:AA:BB:CC:DD:EE",
                },
            ],
        });

        test("Good host_id", () =>
            testValid({
                devices: [
                    {
                        type: "snapcast_client",
                        name: "Client",
                        server: "Snapcast",
                        host_id: "computer.example.com",
                    },
                ],
            }));

        test("No server", () =>
            testInvalid({
                devices: [
                    {
                        type: "snapcast_client",
                        name: "Client",
                        mac: "00:AA:BB:CC:DD:EE",
                    },
                ],
            }));

        test("No MAC Address or host_id", () =>
            testInvalid({
                devices: [
                    {
                        type: "snapcast_client",
                        name: "Client",
                        server: "Snapcast",
                    },
                ],
            }));

        ["test", "00:11:22:33:44:55:66", "00:11:22:33:44:GG"].forEach((mac) =>
            test(`Bad MAC ${mac}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "snapcast_client",
                            name: "Client",
                            server: "Snapcast",
                            mac,
                            host_id: "client.home",
                        },
                    ],
                })),
        );
    });
});
