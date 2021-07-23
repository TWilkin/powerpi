import { Device, DeviceStatusMessage, PowerPiApi } from "powerpi-common-api";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

export default function useGetDevices(api: PowerPiApi) {
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
