import { MetricValue, Sensor } from "@powerpi/common-api";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
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
        // TODO make this use a map
        if (isEnabled(sensor.metrics.current)) {
            yield buildSensor(sensor, "current", t("common.sensors.labels.current"));
        }

        if (isEnabled(sensor.metrics.door)) {
            yield buildSensor(sensor, "door", t("common.sensors.labels.door"));
        }

        if (isEnabled(sensor.metrics.humidity)) {
            yield buildSensor(sensor, "humidity", t("common.sensors.labels.humidity"));
        }

        if (isEnabled(sensor.metrics.motion)) {
            yield buildSensor(sensor, "motion", t("common.sensors.labels.motion"));
        }

        if (isEnabled(sensor.metrics.power)) {
            yield buildSensor(sensor, "power", t("common.sensors.labels.power"));
        }

        if (isEnabled(sensor.metrics.temperature)) {
            yield buildSensor(sensor, "temperature", t("common.sensors.labels.temperature"));
        }

        if (isEnabled(sensor.metrics.voltage)) {
            yield buildSensor(sensor, "voltage", t("common.sensors.labels.electricalPotential"));
        }

        if (isEnabled(sensor.metrics.window)) {
            yield buildSensor(sensor, "window", t("common.sensors.labels.window"));
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
