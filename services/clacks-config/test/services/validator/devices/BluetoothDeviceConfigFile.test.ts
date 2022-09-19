import commonSensorTests from "./commonSensorTests";

function commonBluetoothTests(validFile: object) {
    const { getSensor, testValid, testInvalid } = commonSensorTests(validFile);

    test("No MAC Address", () => {
        const sensor = getSensor(validFile);
        delete sensor.mac;

        testInvalid({ ...validFile, sensors: [sensor] });
    });

    ["test", "00:11:22:33:44:55:66", "00:11:22:33:44:GG"].forEach((mac) =>
        test(`Bad MAC ${mac}`, () => {
            const sensor = getSensor(validFile);
            sensor.mac = mac;

            testInvalid({ ...validFile, sensors: [sensor] });
        })
    );

    return {
        getSensor,
        testValid,
        testInvalid,
    };
}

describe("Bluetooth Devices", () => {
    describe("Bluetooth Presence", () => {
        commonBluetoothTests({
            sensors: [{ type: "bluetooth_presence", name: "Presence", mac: "00:AA:BB:CC:DD:EE" }],
        });
    });
});
