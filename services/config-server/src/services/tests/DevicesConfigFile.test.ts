import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "./setupValidator";

describe("Devices", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Devices, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Devices, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ devices: [], sensors: [] }));

    test("Valid file", () =>
        testValid({
            $schema:
                "https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/src/schema/config/devices.schema.json",
            devices: [
                { type: "log", name: "Logger", message: "Test" },
                { type: "delay", name: "Delay", start: 10, end: 5 },
            ],
            sensors: [
                {
                    type: "powerpi",
                    name: "Temp",
                    metrics: { temperature: "visible" },
                    location: "Garden",
                },
                {
                    type: "powerpi",
                    name: "Humidity",
                    metrics: { humidity: "visible" },
                    location: "Garden",
                },
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
                sensors: [
                    {
                        name: "Temp",
                        metrics: { temperature: "visible" },
                        location: "Garden",
                    },
                ],
            }));
    });
});
