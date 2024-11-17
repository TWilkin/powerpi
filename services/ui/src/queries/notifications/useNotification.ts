import {
    CapabilityStatusMessage,
    ConfigFileType,
    ConfigStatusMessage,
    DeviceStatusMessage,
} from "@powerpi/common-api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import QueryKeyFactory from "../QueryKeyFactory";
import useAPI from "../useAPI";
import useDevicePatcher from "../useDevicePatcher";
import useDeviceChangingState from "./useDeviceChangingState";

export default function useNotification() {
    const api = useAPI();

    const queryClient = useQueryClient();

    const patchDevice = useDevicePatcher();
    const { setChangingState } = useDeviceChangingState();

    // handle socket.io updates
    useEffect(() => {
        async function handleConfigChange(message: ConfigStatusMessage) {
            if (message.type === ConfigFileType.Devices) {
                await queryClient.invalidateQueries({ queryKey: QueryKeyFactory.devices });
            }
        }

        async function handleDeviceStatusChange(message: DeviceStatusMessage) {
            patchDevice(message.device, {
                state: message.state,
                since: message.timestamp,
                additionalState: message.additionalState,
            });

            if (setChangingState) {
                setChangingState(message.device, false);
            }
        }

        async function handleCapabilityChange(message: CapabilityStatusMessage) {
            patchDevice(message.device, {
                capability: message.capability,
                since: message.timestamp,
            });
        }

        // add the listeners
        api.addConfigChangeListener(handleConfigChange);
        api.addDeviceListener(handleDeviceStatusChange);
        api.addCapabilityListener(handleCapabilityChange);

        // remove the listeners
        return () => {
            api.removeConfigChangeListener(handleConfigChange);
            api.removeDeviceListener(handleDeviceStatusChange);
            api.removeCapabilityListener(handleCapabilityChange);
        };
    }, [api, patchDevice, queryClient, setChangingState]);
}
