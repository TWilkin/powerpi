import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    setupValidator,
    testInvalid as _testInvalid,
    testValid as _testValid,
} from "./setupValidator";

describe("Devices", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Devices, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Devices, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ devices: [], sensors: [] }));

    test("Valid file", () =>
        testValid({
            devices: [
                { type: "log", name: "Logger", message: "Test" },
                { type: "delay", name: "Delay", start: 10, stop: 5 },
            ],
            sensors: [
                { type: "temperature", name: "Temp", location: "Garden", entity: "Garden" },
                { type: "humidity", name: "Humidity", location: "Garden", entity: "Garden" },
            ],
        }));

    test("Other properties", () => testInvalid({ devices: [], sensors: [], something: "else" }));

    describe("Devices", () => {
        test("No type", () =>
            testInvalid({
                devices: [{ name: "Logger", message: "Test" }],
                sensors: [],
            }));
    });

    describe("Sensors", () => {
        test("No type", () =>
            testInvalid({
                devices: [],
                sensors: [{ name: "Temp", location: "Garden", entity: "Garden" }],
            }));
    });
});
