import {
    faCode,
    faComputer,
    faGreaterThanEqual,
    faLayerGroup,
    faLightbulb,
    faLock,
    faPanorama,
    faPlug,
    faQuestion,
    faStopwatch,
    faTowerBroadcast,
    faTv,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import styles from "./DeviceIcon.module.scss";

type DeviceIconProps = {
    type: string;
};

const DeviceIcon = ({ type }: DeviceIconProps) => {
    const icon = useMemo(() => getDeviceTypeIcon(type), [type]);

    return (
        <div className={styles.icon}>
            <FontAwesomeIcon icon={icon} />
        </div>
    );
};
export default DeviceIcon;

function getDeviceTypeIcon(type: string) {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split.at(0) ?? type : type;
    const deviceType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    switch (manufacturerType) {
        case "harmony":
            return faTv;

        default:
            switch (deviceType) {
                case "composite":
                    return faLayerGroup;

                case "condition":
                    return faGreaterThanEqual;

                case "computer":
                    return faComputer;

                case "delay":
                    return faStopwatch;

                case "light":
                    return faLightbulb;

                case "mutex":
                    return faLock;

                case "pairing":
                    return faTowerBroadcast;

                case "scene":
                    return faPanorama;

                case "socket":
                case "socket_group":
                    return faPlug;

                case "variable":
                    return faCode;

                default:
                    return faQuestion;
            }
    }
}
