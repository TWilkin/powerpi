import { Sensor } from "@powerpi/api";
import { Fragment, useCallback } from "react";
import ReactTooltip from "react-tooltip";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import BatteryIcon from "../Components/BatteryIcon";
import FormattedValue from "../Components/FormattedValue";
import SensorIcon from "../Components/SensorIcon";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
    title: string;
    location: string;
    floor: string;
    sensors: Sensor[];
}

const Tooltip = ({ title, location, floor, sensors }: TooltipProps) => {
    const getType = useCallback((sensor: Sensor) => sensor.type.split("_").at(-1), []);

    return (
        <ReactTooltip id={`${floor}${location}`} className={styles.tooltip} clickable>
            <h3>{title}</h3>

            <div className={styles.sensors}>
                {sensors.map((sensor) => (
                    <Fragment key={sensor.name}>
                        <SensorIcon type={sensor.type} className={styles.icon} />

                        <p className={styles.title}>{getType(sensor)}:</p>

                        <p className={styles.data}>
                            {sensor.value !== undefined && sensor.unit ? (
                                <FormattedValue value={sensor.value} unit={sensor.unit} />
                            ) : (
                                sensor.state
                            )}
                        </p>

                        <BatteryIcon sensor={sensor} className={styles.battery} />

                        <AbbreviatingTime date={sensor.since} abbreviate className={styles.time} />
                    </Fragment>
                ))}
            </div>
        </ReactTooltip>
    );
};
export default Tooltip;
