import { Device, DeviceState, DeviceStatusMessage } from "@powerpi/api";
import { BatteryStatusMessage } from "@powerpi/api/dist/src/BatteryStatus";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import useAPI from "./api";

export function useGetDevices() {
    const api = useAPI();
    const [devices, setDevices] = useState<Device[] | undefined>();
    const { isLoading, isError, data } = useQuery("devices", () => api.getDevices());

    // handle react-query updates
    useEffect(() => setDevices(data), [data]);

    // handle socket.io updates
    useEffect(() => {
        const onStatusUpdate = (message: DeviceStatusMessage) => {
            if (!devices) {
                return;
            }

            const index = devices.findIndex((device) => device.name === message.device);
            if (index !== -1) {
                const newDevices = [...devices];

                newDevices[index] = { ...newDevices[index] };
                newDevices[index].state = message.state;
                newDevices[index].since = message.timestamp;

                setDevices(newDevices);
            }
        };

        const onBatteryUpdate = (message: BatteryStatusMessage) => {
            if (!devices || !message.device) {
                return;
            }

            const index = devices.findIndex((device) => device.name === message.device);
            if (index !== -1) {
                const newDevices = [...devices];

                newDevices[index] = { ...newDevices[index] };
                newDevices[index].battery = message.battery;
                newDevices[index].batterySince = message.timestamp;
                newDevices[index].charging = message.charging;

                setDevices(newDevices);
            }
        };

        api.addDeviceListener(onStatusUpdate);
        api.addBatteryListener(onBatteryUpdate);

        return () => {
            api.removeDeviceListener(onStatusUpdate);
            api.removeBatteryListener(onBatteryUpdate);
        };
    }, [api, devices, setDevices]);

    return {
        isDevicesLoading: isLoading,
        isDevicesError: isError,
        devices,
    };
}

export function useSetDeviceState(device: Device) {
    const api = useAPI();
    const [changeState, setChangeState] = useState(DeviceState.Unknown);
    const [loading, setLoading] = useState(false);

    // manually handling loading as we want to change it when socket.io
    // updates the state
    useEffect(() => setLoading(false), [device.state]);

    const mutation = useMutation(
        async (newState: DeviceState) => {
            setLoading(true);
            api.postMessage(device.name, newState);
        },
        {
            onError: () => setChangeState(DeviceState.Unknown),
        }
    );

    return {
        updateDeviceState: mutation.mutateAsync,
        isDeviceStateLoading: loading || mutation.isLoading,
        changeState,
    };
}
