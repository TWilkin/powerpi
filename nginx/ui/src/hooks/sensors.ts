import { Sensor, SensorStatusMessage } from "@powerpi/api";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import useAPI from "./api";

export default function useGetSensors() {
    const api = useAPI();
    const [sensors, setSensors] = useState<Sensor[] | undefined>();
    const { isLoading, isError, data } = useQuery("sensors", () => api.getSensors());

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

                if (message.battery !== undefined) {
                    newSensor.battery = message.battery;
                    newSensor.batterySince = message.batteryTimestamp;
                }

                setSensors(newSensors);
            }
        };

        api.addSensorListener(onStatusUpdate);
        return () => api.removeSensorListener(onStatusUpdate);
    }, [api, sensors, setSensors]);

    return {
        isSensorsLoading: isLoading,
        isSensorsError: isError,
        sensors,
    };
}
