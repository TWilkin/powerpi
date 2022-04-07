import {
    faBattery,
    faBatteryEmpty,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sensor } from "@powerpi/api";
import classNames from "classnames";
import { useMemo } from "react";
import styles from "./BatteryIcon.module.scss";

interface BatteryIconProps {
    sensor: Sensor;
    className?: string;
}

const BatteryIcon = ({ sensor, className }: BatteryIconProps) => {
    const icon = useMemo(() => {
        if (sensor.battery !== undefined) {
            if (sensor.battery <= 5) {
                return faBatteryEmpty;
            }
            if (sensor.battery <= 25) {
                return faBatteryQuarter;
            }
            if (sensor.battery <= 50) {
                return faBatteryHalf;
            }
            if (sensor.battery <= 75) {
                return faBatteryThreeQuarters;
            }
            return faBattery;
        }
        return undefined;
    }, [sensor.battery]);

    const warningStyle = useMemo(() => {
        if (sensor.battery !== undefined) {
            if (sensor.battery <= 10) {
                return styles.low;
            }
            if (sensor.battery <= 25) {
                return styles.warning;
            }
        }

        return undefined;
    }, [sensor.battery]);

    const outdated = useMemo(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return (sensor.batterySince ?? 0) <= weekAgo.getTime();
    }, [sensor.batterySince]);

    return (
        <>
            {icon && (
                <FontAwesomeIcon
                    icon={icon}
                    className={classNames(
                        styles.icon,
                        className,
                        {
                            [styles.outdated]: outdated,
                        },
                        warningStyle
                    )}
                />
            )}
        </>
    );
};
export default BatteryIcon;
