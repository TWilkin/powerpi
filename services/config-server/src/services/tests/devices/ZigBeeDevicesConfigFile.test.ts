import commonDeviceTests from "./commonDeviceTests";
import commonSensorTests from "./commonSensorTests";

function commonZigBeeTests(validFile: object, sensor = false) {
    const { getDevice, testValid, testInvalid } = sensor
        ? commonSensorTests(validFile)
        : commonDeviceTests(validFile);

    function populateConfig(device: object) {
        if (sensor) {
            return { devices: [], ...validFile, sensors: [device] };
        }

        return { sensors: [], ...validFile, devices: [device] };
    }

    test("No nwk", () => {
        const device = getDevice(validFile);
        delete device.nwk;

        testInvalid(populateConfig(device));
    });

    [1, "test", "0xabcg"].forEach((nwk) =>
        test(`Bad nwk ${nwk}`, () => {
            const device = getDevice(validFile);
            device.nwk = nwk;

            testInvalid(populateConfig(device));
        }),
    );

    test("No ieee", () => {
        const device = getDevice(validFile);
        delete device.ieee;

        testInvalid(populateConfig(device));
    });

    [1, "test", "00:11:22:33:44:55:66:88", "00:11:22:33:44:55:66:GG"].forEach((ieee) =>
        test(`Bad ieee ${ieee}`, () => {
            const device = getDevice(validFile);
            device.ieee = ieee;

            testInvalid(populateConfig(device));
        }),
    );

    return {
        getSensor: sensor ? getDevice : undefined,
        getDevice: sensor ? undefined : getDevice,
        testValid,
        testInvalid,
    };
}

describe("ZigBee Devices", () => {
    ["door", "window"].forEach((sensorType) => {
        const type = `aqara_${sensorType}`;

        describe(`Aqara ${sensorType} Sensor`, () => {
            const { testInvalid } = commonZigBeeTests(
                {
                    sensors: [
                        {
                            type,
                            name: "Aqara",
                            nwk: "0xabcd",
                            ieee: "00:11:22:33:44:55:66:77",
                            metrics: {
                                [sensorType]: "visible",
                            },
                            location: "Hallway",
                        },
                    ],
                },
                true,
            );

            test("Wrong metric", () =>
                testInvalid({
                    sensors: [
                        {
                            type,
                            name: "Aqara",
                            nwk: "0xabcd",
                            ieee: "00:11:22:33:44:55:66:77",
                            metrics: {
                                [sensorType === "door" ? "window" : "door"]: "visible",
                            },
                            location: "Hallway",
                        },
                    ],
                }));
        });
    });

    describe("Energy Monitor", () => {
        const { testInvalid } = commonZigBeeTests(
            {
                sensors: [
                    {
                        type: "zigbee_energy_monitor",
                        name: "EnergyMonitor",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        metrics: {
                            power: "visible",
                            current: "read",
                            voltage: "none",
                        },
                        location: "Hallway",
                    },
                ],
            },
            true,
        );

        test("No metrics", () =>
            testInvalid({
                sensors: [
                    {
                        type: "zigbee_energy_monitor",
                        name: "EnergyMonitor",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        location: "Hallway",
                    },
                ],
            }));

        const invalidMetrics = ["ready", 1, true];
        test.each(invalidMetrics)("Bad metric $metric", (metric) =>
            testInvalid({
                sensors: [
                    {
                        type: "zigbee_energy_monitor",
                        name: "EnergyMonitor",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        metrics: {
                            power: metric,
                        },
                        location: "Hallway",
                    },
                ],
            }),
        );
    });

    describe("Light", () => {
        const { testValid, testInvalid } = commonZigBeeTests({
            devices: [
                {
                    type: "zigbee_light",
                    name: "Light",
                    nwk: "0xabcd",
                    ieee: "00:11:22:33:44:55:66:77",
                    duration: 1000,
                },
            ],
        });

        test("No duration", () =>
            testValid({
                devices: [
                    {
                        type: "zigbee_light",
                        name: "Light",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                    },
                ],
            }));

        [-1, "5"].forEach((duration) =>
            test(`Bad duration ${duration}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "zigbee_light",
                            name: "Light",
                            nwk: "0xabcd",
                            ieee: "00:11:22:33:44:55:66:77",
                            duration,
                        },
                    ],
                })),
        );
    });

    describe("Socket", () => {
        commonZigBeeTests({
            devices: [
                {
                    type: "zigbee_socket",
                    name: "Socket",
                    nwk: "0xabcd",
                    ieee: "00:11:22:33:44:55:66:77",
                },
            ],
        });
    });

    describe("Ikea Styrbar Switch Sensor", () => {
        commonZigBeeTests(
            {
                sensors: [
                    {
                        type: "ikea_styrbar_switch",
                        name: "Switch",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        location: "Hallway",
                    },
                ],
            },
            true,
        );
    });

    describe("Osram Switch Mini Sensor", () => {
        commonZigBeeTests(
            {
                sensors: [
                    {
                        type: "osram_switch_mini",
                        name: "Osram",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        location: "Hallway",
                    },
                ],
            },
            true,
        );
    });

    describe("Sonoff Switch Sensor", () => {
        commonZigBeeTests(
            {
                sensors: [
                    {
                        type: "sonoff_switch",
                        name: "Switch",
                        nwk: "0xabcd",
                        ieee: "00:11:22:33:44:55:66:77",
                        location: "Hallway",
                    },
                ],
            },
            true,
        );
    });

    describe("ZigBee Pairing", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "zigbee_pairing", name: "Pairing", timeout: 1 }],
        });

        [1, 10].forEach((timeout) =>
            test(`Good timeout ${timeout}`, () =>
                testValid({
                    devices: [{ type: "zigbee_pairing", name: "Pairing", timeout }],
                })),
        );

        [-1, 0].forEach((timeout) =>
            test(`Bad timeout ${timeout}`, () =>
                testInvalid({
                    devices: [{ type: "zigbee_pairing", name: "Pairing", timeout }],
                })),
        );
    });
});
