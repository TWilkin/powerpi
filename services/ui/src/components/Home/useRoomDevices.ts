import { useMemo } from "react";
import { chain as _ } from "underscore";
import { useGetDevices } from "../../hooks/devices";
import useGetSensors from "../../hooks/sensors";

export default function useRoomDevices(room: string) {
    const { devices } = useGetDevices();
    const { sensors } = useGetSensors();

    return useMemo(() => {
        const deviceList = _(devices)
            .filter((device) => device.location === room)
            .groupBy((device) => device.type)
            .map((group) => ({
                deviceType: "device",
                type: group[0].type,
                count: group.length,
            }))
            .value();

        const sensorList = _(sensors)
            .filter((device) => device.location === room)
            .groupBy((sensor) => sensor.type)
            .map((group) => ({
                deviceType: "sensor",
                type: group[0].type,
                count: group.length,
            }))
            .value();

        return _(deviceList.concat(sensorList))
            .sortBy((device) => device.count)
            .reverse()
            .value();
    }, [devices, room, sensors]);
}
