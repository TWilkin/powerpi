import { Device, DeviceState } from "@powerpi/common-api";
import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useDeviceFilter from "./useDeviceFilter";

const mocks = vi.hoisted(() => ({
    useDevices: vi.fn(),
}));

vi.mock("../../queries/useDevices", () => ({ default: mocks.useDevices }));

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
    ];

    test("search", () => {
        mocks.useDevices.mockReturnValue({ data });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.devices).toStrictEqual(data);

        act(() => result.current.dispatch({ type: "Search", search: "something" }));

        expect(result.current.state).toStrictEqual({ search: "something" });
        expect(result.current.state).toStrictEqual({ search: "something" });
        expect(result.current.devices).toHaveLength(0);

        act(() => result.current.dispatch({ type: "Search", search: "bed" }));

        expect(result.current.state).toStrictEqual({ search: "bed" });
        expect(result.current.devices).toStrictEqual([data[0]]);

        act(() => result.current.dispatch({ type: "Search", search: "lounge" }));

        expect(result.current.state).toStrictEqual({ search: "lounge" });
        expect(result.current.devices).toStrictEqual([data[1]]);
    });

    test("clears", () => {
        mocks.useDevices.mockReturnValue({ data });

        const { result } = renderHook(useDeviceFilter);

        expect(result.current.devices).toStrictEqual(data);

        act(() => result.current.dispatch({ type: "Search", search: "something" }));

        expect(result.current.state).toStrictEqual({ search: "something" });
        expect(result.current.devices).toHaveLength(0);

        act(() => result.current.dispatch({ type: "Clear" }));

        expect(result.current.state).toStrictEqual({ search: "" });
        expect(result.current.devices).toStrictEqual(data);
    });
});
