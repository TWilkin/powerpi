import { Device, DeviceState, PowerPiApi, Sensor } from "@powerpi/common-api";
import { instance, mock, when } from "ts-mockito";
import { renderHook, waitFor } from "../../test-setup";
import useRoomDevices from "./useRoomDevices";

test("useRoomDevice", async () => {
    const api = setupAPI();

    const { result } = renderHook(() => useRoomDevices("MyRoom"), { api: instance(api) });

    await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toStrictEqual([
            {
                deviceType: "sensor",
                type: "door",
                count: 3,
                state: undefined,
            },
            {
                deviceType: "device",
                type: "light",
                count: 2,
                state: DeviceState.On,
            },
            {
                deviceType: "device",
                type: "socket",
                count: 2,
                state: undefined,
            },
            {
                deviceType: "sensor",
                type: "window",
                count: 2,
                state: "open",
            },
        ]);
    });
});

function setupAPI() {
    const api = mock<PowerPiApi>();

    when(api.getDevices()).thenResolve([
        // these will be grouped, but the states won't
        createDevice("Socket1", "socket"),
        createDevice("Socket2", "socket", "MyRoom", DeviceState.On),
        // this is in the wrong room
        createDevice("WrongRoom", "socket", "MyOtherRoom"),
        // this is not visible
        createDevice("Invisible", "socket", "MyRoom", DeviceState.Off, false),
        // these will have state
        createDevice("Light1", "light", "MyRoom", DeviceState.On),
        createDevice("Light2", "light", "MyRoom", DeviceState.On),
    ]);

    when(api.getSensors()).thenResolve([
        // these will be grouped and should come first
        createSensor("Door1", "door"),
        createSensor("Door2", "door"),
        createSensor("Door3", "door"),
        // this is in the wrong room
        createSensor("WrongRoom", "temperature", "MyOtherRoom"),
        // this is not visible
        createDevice("Invisible", "temperature", "MyRoom", undefined, false),
        // these will have state
        createSensor("Window1", "window", "MyRoom", "open"),
        createSensor("Window2", "window", "MyRoom", "open"),
    ]);

    return api;
}

function createSensor(
    name: string,
    type: string,
    location = "MyRoom",
    state: string | undefined = undefined,
    visible = true,
): Sensor {
    return {
        name,
        display_name: name,
        type,
        state,
        since: 1,
        visible,
        location,
    };
}

function createDevice(
    name: string,
    type: string,
    location = "MyRoom",
    state = DeviceState.Unknown,
    visible = true,
) {
    return createSensor(name, type, location, state, visible) as Device;
}
