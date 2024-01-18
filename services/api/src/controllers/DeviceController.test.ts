import { MqttService } from "@powerpi/common";
import { Device, DeviceChangeMessage, DeviceState } from "@powerpi/common-api";
import { Response } from "express";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import { DeviceStateService } from "../services";
import DeviceController from "./DeviceController";

const mockedDeviceStateService = mock<DeviceStateService>();
const mockedMqttService = mock<MqttService>();
const mockedResponse = mock<Response>();

describe("DeviceController", () => {
    let subject: DeviceController | undefined;

    beforeEach(() => {
        resetCalls(mockedMqttService);
        resetCalls(mockedResponse);

        subject = new DeviceController(
            instance(mockedDeviceStateService),
            instance(mockedMqttService),
        );
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

    describe("change", () => {
        [DeviceState.Off, DeviceState.On].forEach((state) =>
            test(`success: ${state}`, async () => {
                const message = {
                    state,
                    brightness: 100,
                };

                await subject?.change("thing", message, instance(mockedResponse));

                verify(mockedMqttService.publish("device", "thing", "change", anything())).once();

                const payload = capture(mockedMqttService.publish);
                expect(payload.first()[3]).toStrictEqual(message);

                verify(mockedResponse.sendStatus(201)).once();
            }),
        );

        [undefined, { nope: true, state: DeviceState.Off }].forEach((data) =>
            test(`bad data: ${data}`, async () => {
                await subject?.change(
                    "thing",
                    data as DeviceChangeMessage,
                    instance(mockedResponse),
                );

                verify(mockedMqttService.publish("device", "thing", "change", anything())).never();

                verify(mockedResponse.sendStatus(400)).once();
            }),
        );
    });
});
