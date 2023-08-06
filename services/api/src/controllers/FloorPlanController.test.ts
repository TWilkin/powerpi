import { IFloorplanConfigFile } from "@powerpi/common";
import { instance, mock, when } from "ts-mockito";
import { ConfigService } from "../services";
import FloorPlanController from "./FloorPlanController";

const mockedConfigService = mock<ConfigService>();

describe("FloorPlanController", () => {
    let subject: FloorPlanController | undefined;

    beforeEach(() => {
        subject = new FloorPlanController(instance(mockedConfigService));
    });

    describe("getFloorPlan", () => {
        test("no floorplan", () => {
            when(mockedConfigService.floorplan).thenReturn(
                undefined as unknown as IFloorplanConfigFile,
            );

            const result = subject?.getFloorPlan();

            expect(result).toBeUndefined();
        });

        test("floorplan", () => {
            const floorplan = {
                floorplan: {
                    floors: [],
                },
            };

            when(mockedConfigService.floorplan).thenReturn(floorplan);

            const result = subject?.getFloorPlan();

            expect(result).toStrictEqual({ floors: [] });
        });
    });
});
