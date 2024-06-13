import { PowerPiApi } from "@powerpi/common-api";
import { ConfigFileType } from "@powerpi/common-api/dist/src/ConfigStatus";
import { QueryClient } from "react-query";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import { renderHook, waitFor } from "../test-setup";
import useGetSensors from "./useGetSensors";

describe("useGetSensors", () => {
    const api = mock<PowerPiApi>();

    beforeEach(() => resetCalls(api));

    test("gets data", async () => {
        const sensors = [
            {
                name: "Sensor",
                display_name: "Sensor",
                type: "temperature",
                since: 10,
                visible: true,
            },
        ];

        when(api.getSensors()).thenResolve(sensors);

        const { result } = renderHook(useGetSensors, {
            api: instance(api),
        });

        await waitFor(() => expect(result.current.sensors).toStrictEqual(sensors));
    });

    describe("onConfigChange", () => {
        const queryClient = new QueryClient();
        queryClient.invalidateQueries = jest.fn();

        const getListener = () => capture(api.addConfigChangeListener).first()[0];

        beforeEach(() => jest.resetAllMocks());

        test("expected config type", () => {
            renderHook(useGetSensors, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = getListener();

            listener({ type: ConfigFileType.Devices });

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["powerpi", "sensors"]);
        });

        test("wrong config type", () => {
            renderHook(useGetSensors, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = getListener();

            listener({ type: ConfigFileType.Floorplan });

            expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
        });
    });
});
