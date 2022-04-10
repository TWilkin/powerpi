import { Sensor } from "@powerpi/api";
import { Fragment, useCallback, useMemo } from "react";
import ReactTooltip from "react-tooltip";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import BatteryIcon from "../Components/BatteryIcon";
import FormattedValue from "../Components/FormattedValue";
import SensorIcon from "../Components/SensorIcon";
import styles from "./Tooltip.module.scss";
import scss from "../../styles/exports.module.scss";
import useColourMode from "../../hooks/colour";

interface TooltipProps {
    title: string;
    location: string;
    floor: string;
    sensors: Sensor[];
}

const Tooltip = ({ title, location, floor, sensors }: TooltipProps) => {
    const { isDark } = useColourMode();

    const getType = useCallback((sensor: Sensor) => sensor.type.split("_").at(-1), []);

    const { backgroundColour, textColour } = useMemo(() => {
        if (isDark) {
            return {
                backgroundColour: scss.darkMenu,
                textColour: scss.darkText,
            };
        }

        return {
            backgroundColour: scss.lightMenu,
            textColour: scss.lightText,
        };
    }, [isDark]);

    return (
        <ReactTooltip
            id={`${floor}${location}`}
            className={styles.tooltip}
            clickable
            backgroundColor={backgroundColour}
            textColor={textColour}
        >
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
