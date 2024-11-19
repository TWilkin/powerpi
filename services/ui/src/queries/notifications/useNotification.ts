import {
    BatteryStatusMessage,
    CapabilityStatusMessage,
    ConfigFileType,
    ConfigStatusMessage,
    DeviceStatusMessage,
    SensorStatusMessage,
} from "@powerpi/common-api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import QueryKeyFactory from "../QueryKeyFactory";
import useAPI from "../useAPI";
import useDevicePatcher from "../useDevicePatcher";
import useSensorPatcher from "../useSensorPatcher";
import useDeviceChangingState from "./useDeviceChangingState";

export default function useNotification() {
    const api = useAPI();

    const queryClient = useQueryClient();

    const patchDevice = useDevicePatcher();
    const { setChangingState } = useDeviceChangingState();

    const patchSensor = useSensorPatcher();

    // handle socket.io updates
    useEffect(() => {
        async function handleConfigChange(message: ConfigStatusMessage) {
            if (message.type === ConfigFileType.Devices) {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: QueryKeyFactory.devices }),
                    queryClient.invalidateQueries({ queryKey: QueryKeyFactory.sensors }),
                ]);
            }
        }

        async function handleDeviceStatusChange(message: DeviceStatusMessage) {
            patchDevice(message.device, {
                type: "State",
                state: message.state,
                since: message.timestamp,
                additionalState: message.additionalState,
            });

            if (setChangingState) {
                setChangingState(message.device, false);
            }
        }

        async function handleSensorStatusChange(message: SensorStatusMessage) {
            if ("state" in message) {
                patchSensor(message.sensor, {
                    type: "State",
                    state: message.state,
                    since: message.timestamp,
                });
            } else if ("value" in message) {
                patchSensor(message.sensor, {
                    type: "Data",
                    value: message.value,
                    unit: message.unit,
                    since: message.timestamp,
                });
            }
        }

        async function handleBatteryChange(message: BatteryStatusMessage) {
            if ("device" in message) {
                patchDevice(message.device, {
                    type: "Battery",
                    battery: message.battery,
                    charging: message.charging,
                    batterySince: message.timestamp,
                });
            } else if ("sensor" in message) {
                patchSensor(message.sensor, {
                    type: "Battery",
                    battery: message.battery,
                    charging: message.charging,
                    batterySince: message.timestamp,
                });
            }
        }

        async function handleCapabilityChange(message: CapabilityStatusMessage) {
            patchDevice(message.device, {
                type: "Capability",
                capability: message.capability,
                since: message.timestamp,
            });
        }

        // add the listeners
        api.addConfigChangeListener(handleConfigChange);
        api.addDeviceListener(handleDeviceStatusChange);
        api.addSensorListener(handleSensorStatusChange);
        api.addBatteryListener(handleBatteryChange);
        api.addCapabilityListener(handleCapabilityChange);

        // remove the listeners
        return () => {
            api.removeConfigChangeListener(handleConfigChange);
            api.removeDeviceListener(handleDeviceStatusChange);
            api.removeSensorListener(handleSensorStatusChange);
            api.removeBatteryListener(handleBatteryChange);
            api.removeCapabilityListener(handleCapabilityChange);
        };
    }, [api, patchDevice, patchSensor, queryClient, setChangingState]);
}
