import commonSensorTests from "./commonSensorTests.js";

describe("Octopus Electricity Meter Sensor", () => {
    const { testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "octopus_electricity_meter",
                name: "Sensor",
                metrics: { electricity: "visible" },
                account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
                        mpan: "1234567890123",
                        location: "Hallway",
                        metrics: {
                            electricity: "nope",
                        },
                    },
                ],
            }));
    });

    describe("Account", () => {
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

        test.each(["", 12345])("Empty or invalid account number %s", (account) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_electricity_meter",
                        name: "Sensor",
                        metrics: { electricity: "visible" },
                        mpan: "1234567890123",
                        location: "Hallway",
                        account,
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
                        location: "Hallway",
                        mpan,
                    },
                ],
            }),
        );
    });
});

describe("Octopus Gas Meter Sensor", () => {
    const { testInvalid } = commonSensorTests({
        sensors: [
            {
                type: "octopus_gas_meter",
                name: "Sensor",
                metrics: { gas: "visible" },
                account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: {
                            gas: "nope",
                        },
                    },
                ],
            }));
    });

    describe("Account", () => {
        test("Missing", () =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        mprn: "123456",
                        location: "Hallway",
                        metrics: { gas: "visible" },
                    },
                ],
            }));

        test.each(["", 12345])("Empty or invalid account number %s", (account) =>
            testInvalid({
                sensors: [
                    {
                        type: "octopus_gas_meter",
                        name: "Sensor",
                        metrics: { gas: "visible" },
                        mprn: "123456",
                        location: "Hallway",
                        account,
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
                        account: "A-AAAA1234",
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
                        account: "A-AAAA1234",
                        location: "Hallway",
                        mprn,
                    },
                ],
            }),
        );
    });
});
