import {
    AdditionalState,
    BatteryStatusMessage,
    CapabilityStatusMessage,
    Device,
    DeviceState,
    DeviceStatusMessage,
} from "@powerpi/common-api";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./api";

export function useGetDevices() {
    const api = useAPI();
    const [devices, setDevices] = useState<Device[] | undefined>();
    const { isLoading, isError, data } = useQuery(QueryKeyFactory.devices(), () =>
        api.getDevices(),
    );

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

                newDevices[index].additionalState = {
                    ...newDevices[index].additionalState,
                    ...message.additionalState,
                };

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

        const onCapabilityUpdate = (message: CapabilityStatusMessage) => {
            if (!devices) {
                return;
            }

            const index = devices.findIndex((device) => device.name === message.device);
            if (index !== -1) {
                const newDevices = [...devices];

                newDevices[index] = { ...newDevices[index] };
                newDevices[index].capability = message.capability;

                setDevices(newDevices);
            }
        };

        api.addDeviceListener(onStatusUpdate);
        api.addBatteryListener(onBatteryUpdate);
        api.addCapabilityListener(onCapabilityUpdate);

        return () => {
            api.removeDeviceListener(onStatusUpdate);
            api.removeBatteryListener(onBatteryUpdate);
            api.removeCapabilityListener(onCapabilityUpdate);
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
            api.postDeviceChange(device.name, newState);
        },
        {
            onError: () => setChangeState(DeviceState.Unknown),
        },
    );

    return {
        updateDeviceState: mutation.mutateAsync,
        isDeviceStateLoading: loading || mutation.isLoading,
        changeState,
    };
}

export function useSetDeviceAdditionalState(device: Device) {
    const api = useAPI();
    const [changeAdditionalState, setChangeAdditionalState] = useState<AdditionalState>({});
    const [loading, setLoading] = useState(false);

    // manually handling loading as we want to change it when socket.io
    // updates the state
    useEffect(() => setLoading(false), [device.additionalState]);

    const mutation = useMutation(
        async (newAdditionalState: AdditionalState) => {
            setLoading(true);
            api.postDeviceChange(device.name, undefined, newAdditionalState);
        },
        {
            onError: () => setChangeAdditionalState({}),
        },
    );

    return {
        updateDeviceAdditionalState: mutation.mutateAsync,
        isDeviceAdditionalStateLoading: loading || mutation.isLoading,
        changeAdditionalState,
    };
}
