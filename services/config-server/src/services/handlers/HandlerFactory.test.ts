import { ConfigFileType } from "@powerpi/common";
import { instance, mock } from "ts-mockito";
import Container from "../../container.js";
import DeviceHandler from "./DeviceHandler.js";
import HandlerFactory from "./HandlerFactory.js";

const mockedDeviceHandler = mock<DeviceHandler>();

describe("HandlerFactory", () => {
    let subject: HandlerFactory | undefined;

    beforeEach(() => {
        vi.spyOn(Container, "get").mockImplementation(() => instance(mockedDeviceHandler));
        subject = new HandlerFactory();
    });

    describe("build", () => {
        Object.values(ConfigFileType)
            .filter((fileType) => fileType !== ConfigFileType.Devices)
            .forEach((fileType) =>
                test(`${fileType}`, () => expect(subject?.build(fileType)).toBeUndefined()),
            );

        test("devices", () => {
            const result = subject?.build(ConfigFileType.Devices);

            expect(result).toBe(instance(mockedDeviceHandler));
        });
    });
});
