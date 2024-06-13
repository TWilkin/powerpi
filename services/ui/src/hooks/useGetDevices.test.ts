import { DeviceState, PowerPiApi } from "@powerpi/common-api";
import { ConfigFileType } from "@powerpi/common-api/dist/src/ConfigStatus";
import { QueryClient } from "react-query";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import { act, renderHook, waitFor } from "../test-setup";
import { useGetDevices } from "./useGetDevices";

describe("useGetDevices", () => {
    const api = mock<PowerPiApi>();

    beforeEach(() => resetCalls(api));

    test("gets data", async () => {
        const devices = [
            {
                name: "Device",
                display_name: "Device",
                type: "socket",
                since: 10,
                state: DeviceState.Off,
                visible: true,
            },
        ];

        when(api.getDevices()).thenResolve(devices);

        const { result } = renderHook(useGetDevices, {
            api: instance(api),
        });

        await waitFor(() => expect(result.current.devices).toStrictEqual(devices));
    });

    describe("onConfigChange", () => {
        const queryClient = new QueryClient();
        queryClient.invalidateQueries = jest.fn();

        const getListener = () => capture(api.addConfigChangeListener).first()[0];

        beforeEach(() => jest.resetAllMocks());

        test("expected config type", async () => {
            renderHook(useGetDevices, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = getListener();

            await act(() => listener({ type: ConfigFileType.Devices }));

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["powerpi", "devices"]);
        });

        test("wrong config type", async () => {
            renderHook(useGetDevices, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = getListener();

            await act(() => listener({ type: ConfigFileType.Floorplan }));

            expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
        });
    });
});
