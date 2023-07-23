import { Battery } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import styles from "./BatteryIcon.module.scss";

interface BatteryIconProps {
    sensor: Battery;
    className?: string;
}

const BatteryIcon = ({ sensor, className }: BatteryIconProps) => {
    const icon = useMemo(() => {
        if (sensor.battery !== undefined) {
            if (sensor.battery <= 5) {
                return styles.empty;
            }
            if (sensor.battery <= 25) {
                return styles.quarter;
            }
            if (sensor.battery <= 50) {
                return styles.half;
            }
            if (sensor.battery <= 75) {
                return styles["three-quarters"];
            }
            return styles.full;
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
                <div
                    role="img"
                    className={classNames(
                        styles.icon,
                        className,
                        icon,
                        {
                            [styles.outdated]: outdated,
                            [styles.charging]: sensor.charging,
                        },
                        warningStyle,
                    )}
                />
            )}
        </>
    );
};
export default BatteryIcon;
