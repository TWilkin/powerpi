import commonDeviceTests from "./commonDeviceTests.js";

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
                        host_id: "client.example.com",
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

    describe("Server", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "snapcast_server",
                    name: "Server",
                    hostname: "snapcast.example.com",
                    port: 1337,
                },
            ],
        });

        test("Good IP", () =>
            testValid({
                devices: [
                    {
                        type: "snapcast_server",
                        name: "Server",
                        ip: "192.168.1.200",
                    },
                ],
            }));

        test("No hostname or IP", () =>
            testInvalid({
                devices: [
                    {
                        type: "snapcast_server",
                        name: "Server",
                    },
                ],
            }));

        ["test", "192.168.1.256"].forEach((ip) =>
            test(`Bad IP ${ip}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "snapcast_server",
                            name: "Server",
                            ip,
                        },
                    ],
                })),
        );

        ["test", "0", "65536"].forEach((port) =>
            test(`Bad port ${port}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "snapcast_server",
                            name: "Server",
                            ip: "192.168.1.200",
                            port,
                        },
                    ],
                })),
        );
    });
});
