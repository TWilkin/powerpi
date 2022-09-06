import commonSensorTests from "./commonSensorTests";

describe("Generic Sensors", () => {
    ["electricity", "gas", "humidity", "motion", "temperature"].forEach((type) => {
        describe(`${type} Sensor`, () => {
            const { testInvalid } = commonSensorTests({
                sensors: [{ type, name: "Sensor", location: "Hallway", entity: "Sensor" }],
            });

            test("No location", () =>
                testInvalid({
                    sensors: [{ type, name: "Sensor", entity: "Sensor" }],
                }));

            test("No entity", () =>
                testInvalid({
                    sensors: [{ type, name: "Sensor", location: "Hallway" }],
                }));
        });
    });
});
