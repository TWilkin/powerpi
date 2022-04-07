import {
    faBattery,
    faBatteryEmpty,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useMemo } from "react";
import styles from "./BatteryIcon.module.scss";

interface BatteryIconProps {
    level: number | undefined;
    className?: string;
}

const BatteryIcon = ({ level, className }: BatteryIconProps) => {
    const icon = useMemo(() => {
        if (level !== undefined) {
            if (level <= 5) {
                return faBatteryEmpty;
            }
            if (level <= 25) {
                return faBatteryQuarter;
            }
            if (level <= 50) {
                return faBatteryHalf;
            }
            if (level <= 75) {
                return faBatteryThreeQuarters;
            }
            return faBattery;
        }
        return undefined;
    }, [level]);

    return (
        <>
            {icon && <FontAwesomeIcon icon={icon} className={classNames(styles.icon, className)} />}
        </>
    );
};
export default BatteryIcon;
