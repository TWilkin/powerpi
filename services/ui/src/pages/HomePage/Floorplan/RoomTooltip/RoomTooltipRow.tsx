import { Metric, Sensor, SensorNumericValue, SensorStateValue } from "@powerpi/common-api";
import { useMemo } from "react";
import BatteryIcon from "../../../../components/BatteryIcon";
import SensorIcon from "../../../../components/SensorIcon";
import SensorState from "../../../../components/SensorState";
import Time from "../../../../components/Time";
import Value from "../../../../components/Value";

type RoomTooltipRowProps = {
    type: keyof Metric;

    sensor: Sensor;

    showingBattery: boolean;
};

/** Component containing a row from the tooltip, showing the details for a single sensor. */
const RoomTooltipRow = ({ type, sensor, showingBattery }: RoomTooltipRowProps) => {
    const { state, value } = useMemo(() => {
        if (!Object.hasOwn(sensor.data, type)) {
            return {};
        }

        const data = sensor.data[type];
        if (!data) {
            return {};
        }

        const state = Object.hasOwn(data, "state") ? (data as SensorStateValue) : undefined;

        const value = Object.hasOwn(data, "value") ? (data as SensorNumericValue) : undefined;

        return { state, value };
    }, [sensor.data, type]);

    const since = state?.since ?? value?.since ?? -1;

    return (
        <>
            <SensorIcon type={sensor.type} state={state?.state} />

            {showingBattery &&
                (sensor.battery != null ? <BatteryIcon device={sensor} /> : <span />)}

            <p className="px">{sensor.display_name}:</p>

            <p className="px">
                {value?.value != null && value?.unit ? (
                    <Value type={sensor.type} value={value.value} unit={value.unit} />
                ) : (
                    <SensorState state={state!.state} />
                )}
            </p>

            <Time time={since} />
        </>
    );
};
export default RoomTooltipRow;
