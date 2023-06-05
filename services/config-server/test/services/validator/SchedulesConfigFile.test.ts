import { ConfigFileType, ISchedule } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "./setupValidator";

describe("Schedules", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Schedules, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Schedules, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ timezone: "Europe/London", schedules: [] }));

    test("Valid file", () =>
        testValid({
            $schema:
                "https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/src/schema/config/schedules.schema.json",
            timezone: "Europe/London",
            schedules: [
                {
                    device: "BedroomLight",
                    between: ["01:00:00", "01:59:59"],
                    interval: 60,
                    brightness: [10.1, 99.99],
                    temperature: [2000, 4000],
                },
                {
                    device: "HallwayLight",
                    days: ["Wednesday"],
                    between: ["22:00:00", "23:59:59"],
                    interval: 600,
                    hue: [0, 100],
                    saturation: [0, 100],
                    power: true,
                },
                {
                    devices: ["BedroomLight", "HallwayLight"],
                    between: ["01:00:00", "01:59:59"],
                    interval: 60,
                    condition: {
                        when: [{ equals: [{ var: "device.OfficeLight.state" }, "on"] }],
                    },
                    brightness: [0, 100],
                    temperature: [2000, 4000],
                },
            ],
        }));

    test("No timezone", () => testInvalid({ schedules: [] }));

    test("Other properties", () =>
        testInvalid({ timezone: "Europe/London", schedules: [], something: "else" }));

    describe("Schedule", () => {
        ["device", "between", "interval"].forEach((prop) => {
            test(`No ${prop}`, () => {
                const file = {
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            days: ["Wednesday"],
                            between: ["01:00:00", "01:59:59"],
                            interval: 60,
                            brightness: [0, 100],
                            temperature: [2000, 4000],
                            hue: [0, 360],
                            saturation: [0, 100],
                            power: true,
                        },
                    ],
                };

                delete file.schedules[0][prop as keyof ISchedule];

                testInvalid(file);
            });
        });

        ["brightness", "temperature", "hue", "saturation"].forEach((prop) => {
            test(`Too many arguments to ${prop}`, () =>
                testInvalid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            between: ["01:00:00", "01:59:59"],
                            interval: 60,
                            [prop]: [100, 200, 300],
                        },
                    ],
                }));
        });

        test("duplicate device(s)", () =>
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        devices: ["BedroomLight", "HallwayLight"],
                        between: ["01:00:00", "01:59:59"],
                        interval: 60,
                    },
                ],
            }));

        test("Other properties", () =>
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        between: ["01:00:00", "01:59:59"],
                        interval: 60,
                        something: "else",
                    },
                ],
            }));
    });

    describe("Between", () => {
        test("Too few", () =>
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        between: ["01:01:01"],
                        interval: 60,
                    },
                ],
            }));

        ["01:01:01", "11:11:11", "23:59:59"].forEach((time) => {
            test(`Good time ${time}`, () =>
                testValid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            between: [time, time],
                            interval: 60,
                        },
                    ],
                }));
        });

        ["24:00:00", "11:60:00", "11:11:60", "00/00/00", "blah"].forEach((time) => {
            test(`Bad time ${time}`, () =>
                testInvalid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            between: [time, time],
                            interval: 60,
                        },
                    ],
                }));
        });
    });

    describe("Days", () => {
        test("Good", () =>
            testValid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        between: ["01:00:00", "01:59:59"],
                        interval: 60,
                    },
                ],
            }));

        test("Bad", () =>
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        days: ["McWednesday"],
                        between: ["01:00:00", "01:59:59"],
                        interval: 60,
                    },
                ],
            }));
    });
});
