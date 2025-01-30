import { MetricValue, Sensor } from "@powerpi/common-api";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import Resources from "../../../../@types/resources";
import getSensorType from "../../../../utils/getSensorType";

export default function useSensors(sensors: Sensor[]) {
    const { t } = useTranslation();

    return useMemo(() => {
        // first we need to expand any metrics
        const expanded = sensors.flatMap((sensor) => [...expandMetrics(sensor, t)]);

        // now we can sort and return them
        return _(expanded).sortBy((sensor) =>
            (getSensorType(sensor.type) ?? sensor.type).toLocaleLowerCase(),
        );
    }, [sensors, t]);
}

function* expandMetrics(sensor: Sensor, t: ReturnType<typeof useTranslation>["t"]) {
    if (sensor.metrics) {
        for (const [metric, value] of Object.entries(sensor.metrics)) {
            if (isEnabled(value)) {
                let key: keyof Resources["translation"]["common"]["sensors"]["labels"];

                switch (metric) {
                    case "current":
                    case "door":
                    case "humidity":
                    case "motion":
                    case "power":
                    case "temperature":
                    case "window":
                        key = metric;
                        break;

                    case "voltage":
                        key = "electricalPotential";
                        break;

                    default:
                        continue;
                }

                yield buildSensor(sensor, metric, t(`common.sensors.labels.${key}`));
            }
        }
    } else {
        yield sensor;
    }
}

function isEnabled(metric: MetricValue | undefined) {
    return metric === "visible";
}

function buildSensor(sensor: Sensor, metric: string, translation: string) {
    let displayName = sensor.display_name ?? sensor.name;
    displayName = `${displayName} (${translation})`;

    return {
        ...sensor,
        type: metric,
        name: `${sensor.name}-${metric}`,
        display_name: displayName,
        entity: sensor.name,
        action: metric,
    };
}
