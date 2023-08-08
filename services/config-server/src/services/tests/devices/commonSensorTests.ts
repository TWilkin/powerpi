import { ConfigFileType, IDeviceConfigFile } from "@powerpi/common";
import ValidatorService from "../../ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "../setupValidator";

export default function commonSensorTests(validFile: object) {
    let subject: ValidatorService | undefined;

    const getSensor = (file: IDeviceConfigFile) => {
        if (file.sensors && file.sensors.length > 0) {
            return file.sensors[0] as unknown as { [key: string]: string | number };
        }

        throw new Error("At least one sensor must be specified");
    };

    const testValid = (file: object) =>
        _testValid(subject, ConfigFileType.Devices, { devices: [], ...file });

    const testInvalid = (file: object) =>
        _testInvalid(subject, ConfigFileType.Devices, { devices: [], ...file });

    beforeEach(() => (subject = setupValidator()));

    test("Valid file", () => testValid({ sensors: [], ...validFile }));

    test("No name", () => {
        const sensor = { ...getSensor(validFile) };
        delete sensor.name;

        testInvalid({ devices: [], ...validFile, sensors: [sensor] });
    });

    test("Location", () => {
        const sensor = getSensor(validFile);

        testValid({ devices: [], ...validFile, sensors: [{ ...sensor, location: "LivingRoom" }] });
    });

    test("Visible", () => {
        const sensor = getSensor(validFile);

        testValid({ devices: [], ...validFile, sensors: [{ ...sensor, visible: true }] });
    });

    test("Categories", () => {
        const sensor = getSensor(validFile);

        testValid({
            devices: [],
            ...validFile,
            sensors: [{ ...sensor, categories: ["TV", "Music"] }],
        });
    });

    test("No extras", () => {
        let sensor = getSensor(validFile);
        sensor = { ...sensor, extraProperty: "not allowed" };

        testInvalid({ devices: [], ...validFile, sensors: [sensor] });
    });

    return {
        getSensor,
        getDevice: getSensor,
        testValid,
        testInvalid,
    };
}
