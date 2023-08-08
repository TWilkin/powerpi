import { ConfigFileType } from "@powerpi/common";
import { instance, mock } from "ts-mockito";
import Container from "../../../src/container";
import DeviceHandler from "../../../src/services/handlers/DeviceHandler";
import HandlerFactory from "../../../src/services/handlers/HandlerFactory";

const mockedDeviceHandler = mock<DeviceHandler>();

describe("HandlerFactory", () => {
    let subject: HandlerFactory | undefined;

    beforeEach(() => {
        jest.spyOn(Container, "get").mockImplementation(() => instance(mockedDeviceHandler));
        subject = new HandlerFactory();
    });

    describe("build", () => {
        Object.values(ConfigFileType)
            .filter((fileType) => fileType !== ConfigFileType.Devices)
            .forEach((fileType) =>
                test(fileType, () => expect(subject?.build(fileType)).toBeUndefined()),
            );

        test("devices", () => {
            const result = subject?.build(ConfigFileType.Devices);

            expect(result).toBe(instance(mockedDeviceHandler));
        });
    });
});
