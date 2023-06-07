import { ConfigFileType } from "@powerpi/common";
import ValidatorService from "../../../src/services/ValidatorService";
import {
    testInvalid as _testInvalid,
    testValid as _testValid,
    setupValidator,
} from "./setupValidator";

describe("Events", () => {
    let subject: ValidatorService | undefined;

    const testValid = (file: object) => _testValid(subject, ConfigFileType.Events, file);
    const testInvalid = (file: object) => _testInvalid(subject, ConfigFileType.Events, file);

    beforeEach(() => (subject = setupValidator()));

    test("Default file", () => testValid({ listeners: [] }));

    test("Valid file", () =>
        testValid({
            $schema:
                "https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/src/schema/config/events.schema.json",
            listeners: [
                {
                    topic: "Office/motion",
                    events: [
                        {
                            action: {
                                device: "OfficeLight",
                                state: "on",
                            },
                            condition: {
                                when: [
                                    { equals: [{ var: "message.state" }, "detected"] },
                                    { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                ],
                            },
                        },
                        {
                            action: {
                                device: "OfficeLight",
                                state: "off",
                            },
                            condition: {
                                when: [
                                    { equals: [{ var: "message.state" }, "undetected"] },
                                    { equals: [{ var: "device.OfficeLight.state" }, "on"] },
                                ],
                            },
                        },
                    ],
                },
                {
                    topic: "Office/press",
                    events: [
                        {
                            action: {
                                device: "OfficeLight",
                                patch: [{ op: "replace", path: "/brightness", value: "+5000" }],
                            },
                            condition: {
                                when: [
                                    { equals: [{ var: "message.button" }, "up"] },
                                    { equals: [{ var: "message.type" }, "single"] },
                                ],
                            },
                        },
                    ],
                },
            ],
        }));

    test("Other properties", () => testInvalid({ listeners: [], something: "else" }));

    describe("Listeners", () => {
        test("No topic", () =>
            testInvalid({
                listeners: [
                    {
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                    state: "on",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }));

        test("No events", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/press",
                    },
                ],
            }));

        test("Other properties", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                    state: "on",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                        something: "else",
                    },
                ],
            }));
    });

    describe("Events", () => {
        test("No action", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }));

        test("No condition", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                    state: "on",
                                },
                            },
                        ],
                    },
                ],
            }));

        test("Other properties", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                    state: "on",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                                something: "else",
                            },
                        ],
                    },
                ],
            }));
    });

    describe("Action", () => {
        test("No device", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    state: "on",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }));

        test("No state or patch", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }));

        test("Other properties", () =>
            testInvalid({
                listeners: [
                    {
                        topic: "Office/motion",
                        events: [
                            {
                                action: {
                                    device: "OfficeLight",
                                    state: "on",
                                    something: "else",
                                },
                                condition: {
                                    when: [
                                        { equals: [{ var: "message.state" }, "detected"] },
                                        { equals: [{ var: "device.OfficeLight.state" }, "off"] },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            }));
    });
});
