import { ConfigFileType, IDeviceConfigFile } from "@powerpi/common";
import ValidatorService from "../../../../src/services/ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "../setupValidator";

export default function commonDeviceTests(validFile: object) {
    let subject: ValidatorService | undefined;

    const getDevice = (file: IDeviceConfigFile) => {
        if (file.devices && file.devices.length > 0) {
            return file.devices[0] as unknown as { [key: string]: string | number };
        }

        throw new Error("At least one device must be specified");
    };

    const testValid = (file: object) =>
        _testValid(subject, ConfigFileType.Devices, { sensors: [], ...file });

    const testInvalid = (file: object) =>
        _testInvalid(subject, ConfigFileType.Devices, { sensors: [], ...file });

    beforeEach(() => (subject = setupValidator()));

    test("Valid file", () => testValid({ sensors: [], ...validFile }));

    test("No name", () => {
        const device = { ...getDevice(validFile) };
        delete device.name;

        testInvalid({ sensors: [], ...validFile, devices: [device] });
    });

    test("Location", () => {
        const device = getDevice(validFile);

        testValid({ sensors: [], ...validFile, devices: [{ ...device, location: "LivingRoom" }] });
    });

    test("Visible", () => {
        const device = getDevice(validFile);

        testValid({ sensors: [], ...validFile, devices: [{ ...device, visible: true }] });
    });

    test("Categories", () => {
        const device = getDevice(validFile);

        testValid({
            sensors: [],
            ...validFile,
            devices: [{ ...device, categories: ["TV", "Music"] }],
        });
    });

    return {
        getDevice,
        testValid,
        testInvalid,
    };
}
