import { Device } from "@powerpi/common-api";
import { instance, mock, when } from "ts-mockito";
import { DeviceStateService } from "../services";
import DeviceController from "./DeviceController";

const mockedDeviceStateService = mock<DeviceStateService>();

describe("DeviceController", () => {
    let subject: DeviceController | undefined;

    beforeEach(() => {
        subject = new DeviceController(instance(mockedDeviceStateService));
    });

    test("getAllDevices", () => {
        when(mockedDeviceStateService.devices).thenReturn([
            { name: "MeNotFirst", display_name: "C Sensor" },
            { name: "BSensor" },
            { name: "MeFirst", display_name: "A Sensor" },
        ] as Device[]);

        const result = subject?.getAllDevices();

        expect(result).toStrictEqual([
            { name: "MeFirst", display_name: "A Sensor" },
            { name: "BSensor" },
            { name: "MeNotFirst", display_name: "C Sensor" },
        ]);
    });
});
