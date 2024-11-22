import { BaseDevice, DeviceState } from "@powerpi/common-api";
import { useMemo } from "react";
import { chain as _ } from "underscore";
import useQueryDevices from "../../../queries/useQueryDevices";
import useQuerySensors from "../../../queries/useQuerySensors";

type DeviceList =
    | {
          deviceType: "device" | "sensor";
          device: BaseDevice;
          state: DeviceState | string | undefined;
      }[]
    | undefined;

/** Hook to get, and organise by count and type all the devices/sensors in a room on the floorplan. */
export default function useRoomDevices(room: string) {
    const { data: devices } = useQueryDevices();
    const { data: sensors } = useQuerySensors();

    return useMemo(() => {
        const deviceList: DeviceList = devices.map((device) => ({
            deviceType: "device",
            device,
            state: device.state,
        }));

        const sensorList: DeviceList = sensors.map((sensor) => ({
            deviceType: "sensor",
            device: sensor,
            state: sensor.state,
        }));

        // get all the devices and sensors and group by type, then get the count
        const all = _(deviceList)
            .concat(sensorList)
            .filter(({ device }) => device.location === room && device.visible)
            .groupBy(({ deviceType, device }) => `${deviceType}_${device.type}`)
            .map((group) => {
                const states = _(group)
                    .map((device) => device.state)
                    .unique()
                    .value();

                return {
                    deviceType: group[0].deviceType,
                    type: group[0].device.type,
                    count: group.length,
                    state: states.length === 1 ? states[0] : undefined,
                };
            });

        // sort by count descending, then type alphabetically
        return all
            .sortBy((device) => device.type)
            .reverse()
            .sortBy((device) => device.count)
            .reverse()
            .value();
    }, [devices, room, sensors]);
}
