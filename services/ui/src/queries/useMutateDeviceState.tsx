import { AdditionalState, Device, DeviceState } from "@powerpi/common-api";
import { useMutation } from "@tanstack/react-query";
import { useDeviceChangingState } from "./notifications";
import useAPI from "./useAPI";
import useDevicePatcher from "./useDevicePatcher";

type DeviceStateChange = {
    newState?: DeviceState.On | DeviceState.Off;

    newAdditionalState?: AdditionalState;
};

export default function useMutateDeviceState(device: Device) {
    const api = useAPI();

    const patchDevice = useDevicePatcher();
    const { setChangingState } = useDeviceChangingState();

    return useMutation({
        mutationFn: async ({ newState, newAdditionalState }: DeviceStateChange) => {
            if (newState == null && newAdditionalState == null) {
                // nothing to do
                return;
            }

            if (newState != null) {
                // we don't know what state it's in when we submit so make it unknown
                patchDevice(device.name, {
                    type: "State",
                    state: DeviceState.Unknown,
                    since: new Date().getTime(),
                });
            }

            // indicate that this device is currently changing state
            if (setChangingState) {
                setChangingState(device.name, true);
            }

            await api.postDeviceChange(device.name, newState, newAdditionalState);
        },
    });
}
