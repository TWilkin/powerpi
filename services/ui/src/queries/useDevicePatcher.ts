import { Device } from "@powerpi/common-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import QueryKeyFactory from "./QueryKeyFactory";

export type DeviceStatePatch = Partial<Pick<Device, "state" | "additionalState" | "capability">> &
    Pick<Device, "since">;

export default function useDevicePatcher() {
    const queryClient = useQueryClient();

    return useCallback(
        (name: string, newState: DeviceStatePatch) => {
            queryClient.setQueryData(QueryKeyFactory.devices, (devices: Device[]) => {
                const newDevices = [...devices];

                const index = newDevices.findIndex((device) => device.name === name);
                if (index >= 0) {
                    newDevices[index] = {
                        ...newDevices[index],
                        state: newState.state ?? newDevices[index].state,
                        additionalState: {
                            ...newDevices[index].additionalState,
                            ...newState.additionalState,
                        },
                        since: newState.since,
                        capability: newState.capability ?? newDevices[index].capability,
                    };
                }

                return newDevices;
            });
        },
        [queryClient],
    );
}
