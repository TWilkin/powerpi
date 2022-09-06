import commonDeviceTests from "./commonDeviceTests";
import commonSensorTests from "./commonSensorTests";

function commonZigBeeTests(validFile: object) {
    const { getSensor, testValid, testInvalid } = commonSensorTests(validFile);

    test("No nwk", () => {
        const sensor = getSensor(validFile);
        delete sensor.nwk;

        testInvalid({ devices: [], ...validFile, sensors: [sensor] });
    });

    [1, "test", "0xabcg"].forEach((nwk) =>
        test(`Bad nwk ${nwk}`, () => {
            const sensor = getSensor(validFile);
            sensor.nwk = nwk;

            testInvalid({ devices: [], ...validFile, sensors: [sensor] });
        })
    );

    test("No ieee", () => {
        const sensor = getSensor(validFile);
        delete sensor.ieee;

        testInvalid({ devices: [], ...validFile, sensors: [sensor] });
    });

    [1, "test", "00:11:22:33:44:55:66:88", "00:11:22:33:44:55:66:GG"].forEach((ieee) =>
        test(`Bad ieee ${ieee}`, () => {
            const sensor = getSensor(validFile);
            sensor.ieee = ieee;

            testInvalid({ devices: [], ...validFile, sensors: [sensor] });
        })
    );

    return {
        getSensor,
        testValid,
        testInvalid,
    };
}

describe("ZigBee Devices", () => {
    ["door", "window"].forEach((sensorType) => {
        const type = `aqara_${sensorType}`;

        describe(`Aqara ${sensorType} Sensor`, () => {
            commonZigBeeTests({
                sensors: [{ type, name: "Aqara", nwk: "0xabcd", ieee: "00:11:22:33:44:55:66:77" }],
            });
        });
    });

    describe("Osram Switch Mini Sensor", () => {
        commonZigBeeTests({
            sensors: [
                {
                    type: "osram_switch_mini",
                    name: "Osram",
                    nwk: "0xabcd",
                    ieee: "00:11:22:33:44:55:66:77",
                },
            ],
        });
    });

    describe("ZigBee Pairing", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "zigbee_pairing", name: "Pairing", timeout: 1 }],
        });

        [1, 10].forEach((timeout) =>
            test(`Good timeout ${timeout}`, () =>
                testValid({
                    devices: [{ type: "zigbee_pairing", name: "Pairing", timeout }],
                }))
        );

        [-1, 0].forEach((timeout) =>
            test(`Bad timeout ${timeout}`, () =>
                testInvalid({
                    devices: [{ type: "zigbee_pairing", name: "Pairing", timeout }],
                }))
        );
    });
});
