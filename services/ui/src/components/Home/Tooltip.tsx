import { Sensor } from "@powerpi/common-api";
import classNames from "classnames";
import { Fragment, useCallback, useMemo } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import _ from "underscore";
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
    const getType = useCallback((sensor: Sensor) => {
        const split = sensor.type.split("_");

        if (split.length <= 2) {
            return split.at(-1);
        }

        return split.at(-2);
    }, []);

    const hasBattery = useMemo(
        () => _(sensors).any((sensor) => sensor.batterySince !== undefined),
        [sensors],
    );

    return (
        <ReactTooltip id={`${floor}${location}`} className={styles.tooltip} clickable place="top">
            <h3>{title}</h3>

            <div className={classNames(styles.sensors, { [styles.battery]: hasBattery })}>
                {sensors.map((sensor) => (
                    <Fragment key={sensor.name}>
                        <SensorIcon
                            type={sensor.type}
                            state={sensor?.state}
                            className={styles.icon}
                        />

                        {hasBattery && (
                            <span>
                                <BatteryIcon sensor={sensor} />
                            </span>
                        )}

                        <p className={styles.title}>{getType(sensor)}:</p>

                        <p className={styles.state}>
                            {sensor.value !== undefined && sensor.unit ? (
                                <FormattedValue
                                    type={sensor.type}
                                    value={sensor.value}
                                    unit={sensor.unit}
                                />
                            ) : (
                                sensor.state
                            )}
                        </p>

                        <AbbreviatingTime date={sensor.since} abbreviate className={styles.time} />
                    </Fragment>
                ))}
            </div>
        </ReactTooltip>
    );
};
export default Tooltip;
