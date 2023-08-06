import { MqttService } from "@powerpi/common";
import { DeviceChangeMessage, DeviceState } from "@powerpi/common-api";
import { Response } from "express";
import { anything, capture, instance, mock, resetCalls, verify } from "ts-mockito";
import TopicController from "./TopicController";

const mockedMqttService = mock<MqttService>();
const mockedResponse = mock<Response>();

describe("TopicController", () => {
    let subject: TopicController | undefined;

    beforeEach(() => {
        resetCalls(mockedMqttService);
        resetCalls(mockedResponse);

        subject = new TopicController(instance(mockedMqttService));
    });

    describe("writeMessage", () => {
        [DeviceState.Off, DeviceState.On].forEach((state) =>
            test(`success: ${state}`, () => {
                const message = {
                    state,
                    brightness: 100,
                };

                subject?.writeMessage(
                    "device",
                    "thing",
                    "change",
                    message,
                    instance(mockedResponse),
                );

                verify(mockedMqttService.publish("device", "thing", "change", anything())).once();

                const payload = capture(mockedMqttService.publish);
                expect(payload.first()[3]).toStrictEqual(message);

                verify(mockedResponse.sendStatus(201)).once();
            }),
        );

        [undefined, { nope: true, state: DeviceState.Off }].forEach((data) =>
            test(`bad data: ${data}`, () => {
                subject?.writeMessage(
                    "device",
                    "thing",
                    "change",
                    data as DeviceChangeMessage,
                    instance(mockedResponse),
                );

                verify(mockedMqttService.publish("device", "thing", "change", anything())).never();

                verify(mockedResponse.sendStatus(400)).once();
            }),
        );
    });
});
