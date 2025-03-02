import { ConfigFileType, DeviceInternalSchedule } from "@powerpi/common";
import ValidatorService from "../ValidatorService";
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
                    schedule: "0 1 * * *",
                    duration: 3600,
                    interval: 60,
                    brightness: [10.1, 99.99],
                    temperature: [2000, 4000],
                },
                {
                    device: "HallwayLight",
                    schedule: "0 22 * * 3",
                    duration: 3600,
                    interval: 600,
                    hue: [0, 100],
                    saturation: [0, 100],
                    power: true,
                },
                {
                    devices: ["BedroomLight", "HallwayLight"],
                    schedule: "0 1 * * *",
                    duration: 3600,
                    interval: 60,
                    condition: {
                        when: [{ equals: [{ var: "device.OfficeLight.state" }, "on"] }],
                    },
                    brightness: [0, 100],
                    temperature: [2000, 4000],
                    scene: "movie",
                },
                {
                    device: "BedroomLight",
                    schedule: "0 9 * * 3",
                    brightness: 50,
                },
            ],
        }));

    test("No timezone", () => testInvalid({ schedules: [] }));

    test("Other properties", () =>
        testInvalid({ timezone: "Europe/London", schedules: [], something: "else" }));

    describe("DeviceIntervalSchedule", () => {
        const props: (keyof DeviceInternalSchedule)[] = ["device", "duration", "interval"];
        test.each(props)("No %p", (prop) => {
            const file = {
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        devices: undefined,
                        schedule: "0 1 * * 3",
                        duration: 3600,
                        interval: 60,
                        brightness: [0, 100],
                        temperature: [2000, 4000],
                        hue: [0, 360],
                        saturation: [0, 100],
                        power: true,
                        force: true,
                    },
                ],
            };

            delete file.schedules[0][prop];

            testInvalid(file);
        });

        ["brightness", "temperature", "hue", "saturation"].forEach((prop) => {
            test(`Too many arguments to ${prop}`, () =>
                testInvalid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            schedule: "0 1 * * *",
                            duration: 3600,
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
                        schedule: "0 1 * * *",
                        duration: 3600,
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
                        schedule: "0 1 * * *",
                        duration: 3600,
                        interval: 60,
                        something: "else",
                    },
                ],
            }));
    });

    describe("DeviceSingleSchedule", () => {
        test("No device", () => {
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        devices: undefined,
                        schedule: "0 9 * * 3",
                        brightness: 50,
                        hue: 180,
                        saturation: 75,
                        temperature: 2_000,
                        power: true,
                    },
                ],
            });
        });

        describe("schedule", () => {
            const goodSchedule = ["* * * * *", "*/2 * * * *", "* * * * 1-5", "* * * * 5,7"];
            test.each(goodSchedule)("good %p", (schedule) =>
                testValid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            schedule,
                            brightness: 100,
                        },
                    ],
                }),
            );

            const badSchedule = [null, "", "* * * *", "A * * * *", "* * * * * *"];
            test.each(badSchedule)("bad %p", (schedule) =>
                testInvalid({
                    timezone: "Europe/London",
                    schedules: [
                        {
                            device: "BedroomLight",
                            schedule,
                            brightness: 100,
                        },
                    ],
                }),
            );
        });

        test("Other properties", () =>
            testInvalid({
                timezone: "Europe/London",
                schedules: [
                    {
                        device: "BedroomLight",
                        schedule: "0 9 * * 3",
                        something: "else",
                    },
                ],
            }));
    });

    test("hue", () =>
        testValid({
            timezone: "Europe/London",
            schedules: [
                {
                    device: "BedroomLight",
                    schedule: "0 9 * * *",
                    hue: 180,
                },
            ],
        }));

    test("saturation", () =>
        testValid({
            timezone: "Europe/London",
            schedules: [
                {
                    device: "BedroomLight",
                    schedule: "0 9 * * *",
                    saturation: 50,
                },
            ],
        }));

    test("brightness", () =>
        testValid({
            timezone: "Europe/London",
            schedules: [
                {
                    device: "BedroomLight",
                    schedule: "0 9 * * *",
                    brightness: 75,
                },
            ],
        }));

    test("temperature", () =>
        testValid({
            timezone: "Europe/London",
            schedules: [
                {
                    device: "BedroomLight",
                    schedule: "0 9 * * *",
                    temperature: 2000,
                },
            ],
        }));
});
