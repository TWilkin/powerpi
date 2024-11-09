import { Device, DeviceState } from "@powerpi/common-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./useAPI";

export default function useMutateDeviceState(device: Device) {
    const api = useAPI();

    const queryClient = useQueryClient();

    const deviceName = device.name;

    return useMutation({
        mutationFn: async (newState: DeviceState.On | DeviceState.Off) => {
            // we don't know what state it's in when we submit so make it unknown
            queryClient.setQueryData(QueryKeyFactory.devices, (devices: Device[]) => {
                const newDevices = [...devices];

                const index = newDevices.findIndex((device) => device.name === deviceName);
                if (index >= 0) {
                    newDevices[index] = { ...newDevices[index], state: newState };
                }

                return newDevices;
            });

            api.postDeviceChange(device.name, newState);
        },
    });
}
