import { PowerPiApi } from "@powerpi/common-api";
import { ConfigFileType } from "@powerpi/common-api/dist/src/ConfigStatus";
import { QueryClient } from "react-query";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import { act, renderHook, waitFor } from "../test-setup";
import { useGetFloorplan } from "./useGetFloorplan";

describe("useGetFloorplan", () => {
    const api = mock<PowerPiApi>();

    beforeEach(() => resetCalls(api));

    test("gets data", async () => {
        when(api.getFloorplan()).thenResolve({ floors: [] });

        const { result } = renderHook(useGetFloorplan, {
            api: instance(api),
        });

        await waitFor(() => expect(result.current.floorplan).toStrictEqual({ floors: [] }));
    });

    describe("onConfigChange", () => {
        const queryClient = new QueryClient();
        queryClient.invalidateQueries = jest.fn();

        beforeEach(() => jest.resetAllMocks());

        test("expected config type", async () => {
            renderHook(useGetFloorplan, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = capture(api.addConfigChangeListener).first()[0];

            await act(() => listener({ type: ConfigFileType.Floorplan }));

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["powerpi", "floorplan"]);
        });

        test("wrong config type", async () => {
            renderHook(useGetFloorplan, {
                api: instance(api),
                queryClient: queryClient,
            });

            const listener = capture(api.addConfigChangeListener).first()[0];

            await act(() => listener({ type: ConfigFileType.Devices }));

            expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
        });
    });
});
