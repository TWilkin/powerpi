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
                        max_charge: 100,
                        shutdown_delay: 120,
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                    pwm_fan: {
                        curve: [
                            { temperature: 20, speed: 25 },
                            { temperature: 30, speed: 50 },
                            { temperature: 40, speed: 75 },
                        ],
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

            [
                "charge_battery",
                "max_charge",
                "shutdown_delay",
                "shutdown_level",
                "wake_up_on_charge",
            ].forEach((key) =>
                test(`No ${key}`, () => {
                    const device = {
                        type: "node",
                        name: "Node",
                        ip: "127.0.0.1",
                        pijuice: {
                            charge_battery: true,
                            max_charge: 100,
                            shutdown_delay: 120,
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
                        max_charge: 100,
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                };

                test(`Good max_charge ${value}`, () => {
                    device.pijuice.max_charge = value;
                    testValid({ devices: [device] });
                });

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
                        max_charge: 100,
                        shutdown_level: 15,
                        wake_up_on_charge: 20,
                    },
                };

                test(`Bad max_charge ${value}`, () => {
                    device.pijuice.max_charge = value;
                    testInvalid({ devices: [device] });
                });

                test(`Bad shutdown_level ${value}`, () => {
                    device.pijuice.shutdown_level = value;
                    testInvalid({ devices: [device] });
                });

                test(`Bad wake_up_on_charge ${value}`, () => {
                    device.pijuice.wake_up_on_charge = value;
                    testInvalid({ devices: [device] });
                });
            });

            [-1, 59].forEach((value) =>
                test(`Bad shutdown_delay ${value}`, () =>
                    testInvalid({
                        devices: [
                            {
                                type: "node",
                                name: "Node",
                                ip: "127.0.0.1",
                                pijuice: {
                                    shutdown_delay: value,
                                },
                            },
                        ],
                    }))
            );
        });

        describe("PWM Fan", () => {
            test("No PWM Fan", () =>
                testValid({ devices: [{ type: "node", name: "Node", ip: "127.0.0.1" }] }));

            describe("Curve", () => {
                test("No Curve", () =>
                    testValid({
                        devices: [{ type: "node", name: "Node", ip: "127.0.0.1", pwm_fan: {} }],
                    }));

                [0, 30, 70].forEach((value) =>
                    test(`Good temperature ${value}`, () =>
                        testValid({
                            devices: [
                                {
                                    type: "node",
                                    name: "Node",
                                    ip: "127.0.0.1",
                                    pwm_fan: { curve: [{ temperature: value, speed: 50 }] },
                                },
                            ],
                        }))
                );

                [-1, 71].forEach((value) =>
                    test(`Bad temperature ${value}`, () =>
                        testInvalid({
                            devices: [
                                {
                                    type: "node",
                                    name: "Node",
                                    ip: "127.0.0.1",
                                    pwm_fan: { curve: [{ temperature: value, speed: 50 }] },
                                },
                            ],
                        }))
                );

                [0, 30, 100].forEach((value) =>
                    test(`Good speed ${value}`, () =>
                        testValid({
                            devices: [
                                {
                                    type: "node",
                                    name: "Node",
                                    ip: "127.0.0.1",
                                    pwm_fan: { curve: [{ temperature: 40, speed: value }] },
                                },
                            ],
                        }))
                );

                [-1, 101].forEach((value) =>
                    test(`Bad speed ${value}`, () =>
                        testInvalid({
                            devices: [
                                {
                                    type: "node",
                                    name: "Node",
                                    ip: "127.0.0.1",
                                    pwm_fan: { curve: [{ temperature: 40, speed: value }] },
                                },
                            ],
                        }))
                );
            });
        });
    });
});
