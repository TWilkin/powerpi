import { Sensor } from "@powerpi/common-api";
import { instance, mock, when } from "ts-mockito";
import { SensorStateService } from "../services/index.js";
import SensorController from "./SensorController.js";

const mockedSensorStateService = mock<SensorStateService>();

describe("SensorController", () => {
    let subject: SensorController | undefined;

    beforeEach(() => {
        subject = new SensorController(instance(mockedSensorStateService));
    });

    test("getAllSensors", () => {
        when(mockedSensorStateService.sensors).thenReturn([
            { name: "MeNotFirst", display_name: "C Sensor" },
            { name: "BSensor" },
            { name: "MeFirst", display_name: "A Sensor" },
        ] as Sensor[]);

        const result = subject?.getAllSensors();

        expect(result).toStrictEqual([
            { name: "MeFirst", display_name: "A Sensor" },
            { name: "BSensor" },
            { name: "MeNotFirst", display_name: "C Sensor" },
        ]);
    });
});
