import { ISensor } from "@powerpi/common";
import { anyString, anything, instance, mock, verify } from "ts-mockito";
import ConfigPublishService from "../ConfigPublishService.js";
import DeviceHandler from "./DeviceHandler.js";

const mockedConfigPublishService = mock<ConfigPublishService>();

describe("DeviceHandler", () => {
    let subject: DeviceHandler | undefined;

    beforeEach(() => (subject = new DeviceHandler(instance(mockedConfigPublishService))));

    describe("handle", () => {
        test("no config", async () => {
            const config = {};

            await subject?.handle(config);

            verify(
                mockedConfigPublishService.publishConfigChange(
                    anyString(),
                    anything(),
                    anyString(),
                ),
            ).never();
        });

        test("no sensors", async () => {
            const config = {
                sensors: [],
            };

            await subject?.handle(config);

            verify(
                mockedConfigPublishService.publishConfigChange(
                    anyString(),
                    anything(),
                    anyString(),
                ),
            ).never();
        });

        test("sensors", async () => {
            const config = {
                sensors: [
                    { type: "powerpi", value: 1, name: "sensor1" },
                    { type: "other", value: 2, name: "sensor2" },
                    { type: "powerpi", value: 3, name: "sensor3" },
                ] as unknown as ISensor[],
            };

            await subject?.handle(config);

            verify(
                mockedConfigPublishService.publishConfigChange(
                    anyString(),
                    anything(),
                    anyString(),
                ),
            ).twice();

            verify(
                mockedConfigPublishService.publishConfigChange("sensor1", anything(), anyString()),
            ).once();

            verify(
                mockedConfigPublishService.publishConfigChange("sensor3", anything(), anyString()),
            ).once();
        });
    });
});
