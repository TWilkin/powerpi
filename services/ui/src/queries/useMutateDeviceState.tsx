import { Device, DeviceState } from "@powerpi/common-api";
import { useMutation } from "@tanstack/react-query";
import { useDeviceChangingState } from "./notifications";
import useAPI from "./useAPI";
import useDevicePatcher from "./useDevicePatcher";
// TODO api.postDeviceChange should be async

export default function useMutateDeviceState(device: Device) {
    const api = useAPI();

    const patchDevice = useDevicePatcher();
    const { setChangingState } = useDeviceChangingState();

    return useMutation({
        mutationFn: async (newState: DeviceState.On | DeviceState.Off) => {
            // we don't know what state it's in when we submit so make it unknown
            patchDevice(device.name, {
                state: DeviceState.Unknown,
                since: new Date().getTime(),
            });

            // indicate that this device is currently changing state
            if (setChangingState) {
                setChangingState(device.name, true);
            }

            api.postDeviceChange(device.name, newState);
        },
    });
}
