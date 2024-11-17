import { Device } from "@powerpi/common-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import QueryKeyFactory from "./QueryKeyFactory";

type StateChange = { type: "State" } & Pick<Device, "state" | "additionalState" | "since">;
type CapabilityChange = { type: "Capability" } & Pick<Device, "capability" | "since">;
type BatteryChange = { type: "Battery" } & Pick<Device, "battery" | "charging" | "batterySince">;

export type DevicePatch = StateChange | CapabilityChange | BatteryChange;

export default function useDevicePatcher() {
    const queryClient = useQueryClient();

    return useCallback(
        (name: string, patch: DevicePatch) => {
            queryClient.setQueryData(QueryKeyFactory.devices, (devices: Device[]) => {
                const newDevices = [...devices];

                const index = newDevices.findIndex((device) => device.name === name);
                if (index >= 0) {
                    newDevices[index] = { ...newDevices[index], ...patch };
                }

                return newDevices;
            });
        },
        [queryClient],
    );
}
