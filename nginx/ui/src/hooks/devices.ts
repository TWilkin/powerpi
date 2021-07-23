import {
  Device,
  DeviceState,
  DeviceStatusMessage,
  PowerPiApi
} from "powerpi-common-api";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";

export function useGetDevices(api: PowerPiApi) {
  const [devices, setDevices] = useState<Device[] | undefined>();
  const { isLoading, data } = useQuery("devices", () => api.getDevices());

  // handle react-query updates
  useEffect(() => {
    setDevices(data);
  }, [data]);

  // handle socket.io updates
  useEffect(() => {
    const onStatusUpdate = (message: DeviceStatusMessage) => {
      if (!devices) {
        return;
      }

      const newDevices = [...devices];

      const index = devices.findIndex(
        (device) => device.name === message.device
      );
      if (index) {
        newDevices[index] = { ...newDevices[index] };
        newDevices[index].state = message.state;
        newDevices[index].since = message.timestamp;

        setDevices(newDevices);
      }
    };

    api.addListener(onStatusUpdate);
    return () => api.removeListener(onStatusUpdate);
  }, [devices, setDevices]);

  return {
    isDevicesLoading: isLoading,
    devices
  };
}

export function useSetDeviceState(api: PowerPiApi, device: Device) {
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
      onError: () => setChangeState(DeviceState.Unknown)
    }
  );

  return {
    updateDeviceState: mutation.mutateAsync,
    isDeviceStateLoading: loading || mutation.isLoading,
    changeState
  };
}
