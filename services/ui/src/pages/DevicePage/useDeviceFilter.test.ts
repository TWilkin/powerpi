import { Device, DeviceState } from "@powerpi/common-api";
import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useDeviceFilter from "./useDeviceFilter";

const mocks = vi.hoisted(() => ({
    useQueryDevices: vi.fn(),
}));

vi.mock("../../queries/useQueryDevices", () => ({ default: mocks.useQueryDevices }));

describe("useDeviceFilter", () => {
    const data: Device[] = [
        {
            name: "BedroomLight",
            display_name: "",
            state: DeviceState.On,
            since: 0,
            visible: true,
            type: "light",
        },
        {
            name: "LivingRoomLight",
            display_name: "Lounge Light",
            state: DeviceState.Off,
            since: 0,
            visible: true,
            type: "light",
        },
        {
            name: "Socket",
            display_name: "Socket",
            state: DeviceState.Off,
            since: 0,
            visible: true,
            type: "socket",
        },
    ];

    test("search", () => {
        mocks.useQueryDevices.mockReturnValue({ data });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.devices).toStrictEqual(data);

        act(() => result.current.dispatch({ type: "Search", search: "something" }));

        expect(result.current.state.search).toBe("something");
        expect(result.current.devices).toHaveLength(0);

        act(() => result.current.dispatch({ type: "Search", search: "bed" }));

        expect(result.current.state.search).toBe("bed");
        expect(result.current.devices).toStrictEqual([data[0]]);

        act(() => result.current.dispatch({ type: "Search", search: "lounge" }));

        expect(result.current.state.search).toBe("lounge");
        expect(result.current.devices).toStrictEqual([data[1]]);
    });

    test("types", () => {
        mocks.useQueryDevices.mockReturnValue({ data });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.types).toStrictEqual(["light", "socket"]);
        expect(result.current.state.types).toStrictEqual(["light", "socket"]);

        act(() => result.current.dispatch({ type: "Types", types: [] }));

        expect(result.current.state.types).toHaveLength(0);
        expect(result.current.devices).toHaveLength(0);

        act(() => result.current.dispatch({ type: "Types", types: ["light"] }));

        expect(result.current.state.types).toStrictEqual(["light"]);
        expect(result.current.devices).toStrictEqual([data[0], data[1]]);
    });

    test("visible only", () => {
        const localData = [data[0], { ...data[1], visible: false }];
        mocks.useQueryDevices.mockReturnValue({ data: localData });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.state.visibleOnly).toBeTruthy();
        expect(result.current.devices).toStrictEqual([data[0]]);

        act(() => result.current.dispatch({ type: "VisibleOnly", visibleOnly: false }));

        expect(result.current.state.visibleOnly).toBeFalsy();
        expect(result.current.devices).toHaveLength(2);

        act(() => result.current.dispatch({ type: "VisibleOnly", visibleOnly: true }));

        expect(result.current.state.visibleOnly).toBeTruthy();
        expect(result.current.devices).toHaveLength(1);
    });

    test("clears", () => {
        mocks.useQueryDevices.mockReturnValue({ data });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.devices).toStrictEqual(data);
        expect(result.current.total).toBe(3);

        act(() => {
            result.current.dispatch({ type: "Search", search: "something" });
            result.current.dispatch({ type: "Types", types: ["socket"] });
            result.current.dispatch({ type: "VisibleOnly", visibleOnly: false });
        });

        expect(result.current.state).toStrictEqual({
            search: "something",
            types: ["socket"],
            visibleOnly: false,
        });
        expect(result.current.devices).toHaveLength(0);
        expect(result.current.total).toBe(3);

        act(() => result.current.clear());

        expect(result.current.state).toStrictEqual({
            search: "",
            types: ["light", "socket"],
            visibleOnly: true,
        });
        expect(result.current.devices).toStrictEqual(data);
        expect(result.current.total).toBe(3);
    });
});
