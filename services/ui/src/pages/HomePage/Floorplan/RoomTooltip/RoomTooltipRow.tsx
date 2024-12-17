import { Sensor } from "@powerpi/common-api";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import BatteryIcon from "../../../../components/BatteryIcon";
import SensorIcon from "../../../../components/SensorIcon";
import SensorState from "../../../../components/SensorState";
import Time from "../../../../components/Time";
import Value from "../../../../components/Value";
import getSensorType from "../../../../utils/getSensorType";

type RoomTooltipRowProps = {
    sensor: Sensor;

    showingBattery: boolean;
};

/** Component containing a row from the tooltip, showing the details for a single sensor. */
const RoomTooltipRow = ({ sensor, showingBattery }: RoomTooltipRowProps) => {
    const { t } = useTranslation();

    const name = useMemo(() => {
        const type = getSensorType(sensor.type);

        if (type) {
            return t(`common.sensors.labels.${type}`);
        }

        return sensor.type;
    }, [sensor.type, t]);

    return (
        <>
            <SensorIcon type={sensor.type} state={sensor.state} />

            {showingBattery &&
                (sensor.battery != null ? <BatteryIcon device={sensor} /> : <span />)}

            <p className="px">{name}:</p>

            <p className="px">
                {sensor.value != null && sensor.unit ? (
                    <Value type={sensor.type} value={sensor.value} unit={sensor.unit} />
                ) : (
                    <SensorState state={sensor.state} />
                )}
            </p>

            <Time time={sensor.since} />
        </>
    );
};
export default RoomTooltipRow;
