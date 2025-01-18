import { MetricValue, Sensor } from "@powerpi/common-api";
import { useMemo } from "react";
import _ from "underscore";
import getSensorType from "../../../../utils/getSensorType";

export default function useSensors(sensors: Sensor[]) {
    return useMemo(() => {
        // first we need to expand any metrics
        const expanded = sensors.flatMap((sensor) => [...expandMetrics(sensor)]);

        // now we can sort and return them
        return _(expanded).sortBy((sensor) =>
            (getSensorType(sensor.type) ?? sensor.type).toLocaleLowerCase(),
        );
    }, [sensors]);
}

function* expandMetrics(sensor: Sensor) {
    if (sensor.metrics) {
        if (isEnabled(sensor.metrics.power)) {
            yield {
                ...sensor,
                type: "power",
            };
        }
        if (isEnabled(sensor.metrics.current)) {
            yield {
                ...sensor,
                type: "current",
            };
        }
        if (isEnabled(sensor.metrics.voltage)) {
            yield {
                ...sensor,
                type: "voltage",
            };
        }
    } else {
        yield sensor;
    }
}

function isEnabled(metric: MetricValue | undefined) {
    return metric === "visible";
}
