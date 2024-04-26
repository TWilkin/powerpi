import { BaseDevice } from "@powerpi/common-api";
import { useMemo } from "react";
import { chain as _ } from "underscore";
import { useGetDevices } from "../../hooks/devices";
import useGetSensors from "../../hooks/sensors";

type DeviceList =
    | {
          deviceType: "device" | "sensor";
          device: BaseDevice;
      }[]
    | undefined;

export default function useRoomDevices(room: string) {
    const { devices } = useGetDevices();
    const { sensors } = useGetSensors();

    return useMemo(() => {
        const deviceList: DeviceList = devices?.map((device) => ({ deviceType: "device", device }));

        const sensorList: DeviceList = sensors?.map((sensor) => ({
            deviceType: "sensor",
            device: sensor,
        }));

        // get all the devices and sensors and group by type, then get the count
        const all = _(deviceList)
            .concat(sensorList ?? [])
            .filter(({ device }) => device.location === room && device.visible)
            .groupBy(({ deviceType, device }) => `${deviceType}_${device.type}`)
            .map((group) => ({
                deviceType: group[0].deviceType,
                type: group[0].device.type,
                count: group.length,
            }));

        // sort by count descending, then type alphabetically
        return all
            .sortBy((device) => device.type)
            .reverse()
            .sortBy((device) => device.count)
            .reverse()
            .value();
    }, [devices, room, sensors]);
}
