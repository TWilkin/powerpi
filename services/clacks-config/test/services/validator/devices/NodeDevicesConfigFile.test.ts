import commonDeviceTests from "./commonDeviceTests";

describe("Node Devices", () => {
    describe("Node", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "node",
                    name: "Node",
                    ip: "127.0.0.1",
                    poll_frequency: 120,
                    pijuice: {
                        charge_battery: true,
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                },
            ],
        });

        ["test", "192.168.1.256", null].forEach((ip) =>
            test(`Bad IP ${ip}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "node",
                            name: "Node",
                            ip,
                        },
                    ],
                }))
        );

        describe("PiJuice", () => {
            test("No PiJuice", () =>
                testValid({ devices: [{ type: "node", name: "Node", ip: "127.0.0.1" }] }));

            ["charge_battery", "shutdown_level", "wake_up_on_charge"].forEach((key) =>
                test(`No ${key}`, () => {
                    const device = {
                        type: "node",
                        name: "Node",
                        ip: "127.0.0.1",
                        pijuice: {
                            charge_battery: true,
                            shutdown_level: 15,
                            wake_up_on_charge: 20,
                        },
                    };

                    delete device.pijuice[key as keyof typeof device.pijuice];

                    testValid({ devices: [device] });
                })
            );

            [0, 100].forEach((value) => {
                const device = {
                    type: "node",
                    name: "Node",
                    ip: "127.0.0.1",
                    pijuice: {
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                };

                test(`Good shutdown_level ${value}`, () => {
                    device.pijuice.shutdown_level = value;
                    testValid({ devices: [device] });
                });

                test(`Good wake_up_on_charge ${value}`, () => {
                    device.pijuice.wake_up_on_charge = value;
                    testValid({ devices: [device] });
                });
            });

            [-1, 101].forEach((value) => {
                const device = {
                    type: "node",
                    name: "Node",
                    ip: "127.0.0.1",
                    pijuice: {
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                };

                test(`Bad shutdown_level ${value}`, () => {
                    device.pijuice.shutdown_level = value;
                    testInvalid({ devices: [device] });
                });

                test(`Bad wake_up_on_charge ${value}`, () => {
                    device.pijuice.wake_up_on_charge = value;
                    testInvalid({ devices: [device] });
                });
            });
        });
    });
});
