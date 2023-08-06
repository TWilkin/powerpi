import { Device, IFloorplanConfigFile, Sensor } from "@powerpi/common";
import { instance, mock, when } from "ts-mockito";
import { ConfigService } from "../services";
import ConfigController from "./ConfigController";

const mockedConfigService = mock<ConfigService>();

describe("ConfigController", () => {
    let subject: ConfigController | undefined;

    beforeEach(() => {
        subject = new ConfigController(instance(mockedConfigService));
    });

    describe("getConfig", () => {
        test("hasDevices", async () => {
            setUp({ hasDevices: true });

            const result = await subject?.getConfig();
            expect(result).toStrictEqual({
                hasDevices: true,
                hasFloorplan: false,
                hasSensors: false,
                hasPersistence: false,
            });
        });

        test("hasFloorplan", async () => {
            setUp({ hasFloorplan: true });

            const result = await subject?.getConfig();
            expect(result).toStrictEqual({
                hasDevices: false,
                hasFloorplan: true,
                hasSensors: false,
                hasPersistence: false,
            });
        });

        test("hasSensors", async () => {
            setUp({ hasSensors: true });

            const result = await subject?.getConfig();
            expect(result).toStrictEqual({
                hasDevices: false,
                hasFloorplan: false,
                hasSensors: true,
                hasPersistence: false,
            });
        });

        test("hasPersistence", async () => {
            setUp({ hasPersistence: true });

            const result = await subject?.getConfig();
            expect(result).toStrictEqual({
                hasDevices: false,
                hasFloorplan: false,
                hasSensors: false,
                hasPersistence: true,
            });
        });
    });
});

function setUp({
    hasDevices = false,
    hasFloorplan = false,
    hasSensors = false,
    hasPersistence = false,
}) {
    if (hasDevices) {
        when(mockedConfigService.devices).thenReturn([{ name: "Device1" }] as Device[]);
    } else {
        when(mockedConfigService.devices).thenReturn(undefined as unknown as Device[]);
    }

    if (hasFloorplan) {
        when(mockedConfigService.floorplan).thenReturn({ floorplan: {} } as IFloorplanConfigFile);
    } else {
        when(mockedConfigService.floorplan).thenReturn(
            undefined as unknown as IFloorplanConfigFile,
        );
    }

    if (hasSensors) {
        when(mockedConfigService.sensors).thenReturn([{ name: "Sensor1" }] as Sensor[]);
    } else {
        when(mockedConfigService.sensors).thenReturn(undefined as unknown as Sensor[]);
    }

    when(mockedConfigService.hasPersistence()).thenResolve(hasPersistence);
}
