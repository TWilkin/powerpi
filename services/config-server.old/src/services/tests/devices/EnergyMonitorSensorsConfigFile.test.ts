import commonSensorTests from "./commonSensorTests.js";

describe("Octopus Electricity Meter Sensor", () => {
    const { testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "octopus_electricity_meter",
                name: "Sensor",
                metrics: { electricity: "visible" },
                serial_number: "SN-123",
                mpan: "1234567890123",
                location: "Hallway",
            },
        ],
    });

    describe("Metrics", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        mpan: "1234567890123",
                        location: "Hallway",
                    },
                ],
            }));

        test("Empty", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        mpan: "1234567890123",
                        location: "Hallway",
                        metrics: {},
                    },
                ],
            }));

        test("Incorrect", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        mpan: "1234567890123",
                        location: "Hallway",
                        metrics: {
                            something: "visible",
                        },
                    },
                ],
            }));

        test("Incorrect value", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        mpan: "1234567890123",
                        location: "Hallway",
                        metrics: {
                            electricity: "nope",
                        },
                    },
                ],
            }));
    });

    describe("Serial Number", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        mpan: "1234567890123",
                        location: "Hallway",
                        metrics: { electricity: "visible" },
                    },
                ],
            }));

        test.each([null, undefined, 12345])("Empty or invalid serial number %s", (serialNumber) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        metrics: { electricity: "visible" },
                        mpan: "1234567890123",
                        location: "Hallway",
                        serial_number: serialNumber,
                    },
                ],
            }),
        );
    });

    describe("MPAN", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        location: "Hallway",
                        metrics: { electricity: "visible" },
                    },
                ],
            }));

        test.each(["", 12345])("Empty or invalid MPAN %s", (mpan) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        metrics: { electricity: "visible" },
                        serial_number: "SN-123",
                        location: "Hallway",
                        mpan,
                    },
                ],
            }),
        );
    });
});

describe("Octopus Gas Meter Sensor", () => {
    const { testValid, testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "octopus_gas_meter",
                name: "Sensor",
                metrics: { gas: "visible" },
                serial_number: "SN-123",
                generation: "SMETS2",
                mprn: "123456",
                location: "Hallway",
            },
        ],
    });

    describe("Metrics", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                    },
                ],
            }));

        test("Empty", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: {},
                    },
                ],
            }));

        test("Incorrect", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: {
                            something: "visible",
                        },
                    },
                ],
            }));

        test("Incorrect value", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: {
                            gas: "nope",
                        },
                    },
                ],
            }));
    });

    describe("Serial Number", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: { gas: "visible" },
                    },
                ],
            }));

        test.each([null, undefined, 12345])("Empty or invalid serial number %s", (serialNumber) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        metrics: { gas: "visible" },
                        generation: "SMETS2",
                        mprn: "123456",
                        location: "Hallway",
                        serial_number: serialNumber,
                    },
                ],
            }),
        );
    });

    describe("Generation", () => {
        test.each(["SMETS1", "SMETS2"])("Valid generation %s", (generation) =>
            testValid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        metrics: { gas: "visible" },
                        serial_number: "SN-123",
                        mprn: "123456",
                        location: "Hallway",
                        generation,
                    },
                ],
            }),
        );

        test.each([null, undefined, "SMETS0", 12345])(
            "Empty or invalid generation %s",
            (generation) =>
                testInvalid({
                    sensors: [
                        {
                            type: "octopus_gas_meter",
                            name: "Sensor",
                            metrics: { gas: "visible" },
                            serial_number: "SN-123",
                            mprn: "123456",
                            location: "Hallway",
                            generation,
                        },
                    ],
                }),
        );
    });

    describe("MPRN", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        location: "Hallway",
                        metrics: { gas: "visible" },
                    },
                ],
            }));

        test.each(["", 12345])("Empty or invalid MPRN %s", (mprn) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        metrics: { gas: "visible" },
                        serial_number: "SN-123",
                        generation: "SMETS2",
                        location: "Hallway",
                        mprn,
                    },
                ],
            }),
        );
    });
});
