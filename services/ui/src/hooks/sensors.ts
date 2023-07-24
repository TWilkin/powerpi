import { BatteryStatusMessage, Sensor, SensorStatusMessage } from "@powerpi/common-api";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./api";

export default function useGetSensors() {
    const api = useAPI();
    const [sensors, setSensors] = useState<Sensor[] | undefined>();
    const { isLoading, isError, data } = useQuery(QueryKeyFactory.sensors(), () =>
        api.getSensors(),
    );

    // handle react-query updates
    useEffect(() => setSensors(data), [data]);

    // handle socket.io updates
    useEffect(() => {
        const onStatusUpdate = (message: SensorStatusMessage) => {
            if (!sensors) {
                return;
            }

            const index = sensors.findIndex((sensor) => sensor.name === message.sensor);
            if (index !== -1) {
                const newSensors = [...sensors];

                const newSensor = { ...newSensors[index] };
                newSensors[index] = newSensor;

                if (message.state !== undefined) {
                    newSensor.state = message.state;
                    newSensor.since = message.timestamp;
                }

                if (message.value !== undefined) {
                    newSensor.value = message.value;
                    newSensor.unit = message.unit;
                    newSensor.since = message.timestamp;
                }

                setSensors(newSensors);
            }
        };

        const onBatteryUpdate = (message: BatteryStatusMessage) => {
            if (!sensors || !message.sensor) {
                return;
            }

            const index = sensors.findIndex((sensor) => sensor.name === message.sensor);
            if (index !== -1) {
                const newSensors = [...sensors];

                const newSensor = { ...newSensors[index] };
                newSensors[index] = newSensor;

                if (message.battery !== undefined) {
                    newSensor.battery = message.battery;
                    newSensor.batterySince = message.timestamp;
                    newSensor.charging = message.charging;
                }

                setSensors(newSensors);
            }
        };

        api.addSensorListener(onStatusUpdate);
        api.addBatteryListener(onBatteryUpdate);

        return () => {
            api.removeSensorListener(onStatusUpdate);
            api.removeBatteryListener(onBatteryUpdate);
        };
    }, [api, sensors, setSensors]);

    return {
        isSensorsLoading: isLoading,
        isSensorsError: isError,
        sensors,
    };
}
