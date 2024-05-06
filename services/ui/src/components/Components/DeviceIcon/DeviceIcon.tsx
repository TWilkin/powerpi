import {
    faCode,
    faComputer,
    faGreaterThanEqual,
    faLayerGroup,
    faLightbulb,
    faLock,
    faMusic,
    faPanorama,
    faPlug,
    faQuestion,
    faServer,
    faStopwatch,
    faTowerBroadcast,
    faTv,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useMemo } from "react";
import styles from "./DeviceIcon.module.scss";

type DeviceIconProps = {
    type: string;
} & Omit<FontAwesomeIconProps, "icon">;

const DeviceIcon = ({ type, className, ...props }: DeviceIconProps) => {
    const icon = useMemo(() => getDeviceTypeIcon(type), [type]);

    return (
        <FontAwesomeIcon {...props} icon={icon} className={classNames(className, styles.icon)} />
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

        case "snapcast":
            if (deviceType === "client") {
                return faMusic;
            }
            break;
    }

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

        case "server":
            return faServer;

        case "socket":
        case "socket_group":
            return faPlug;

        case "variable":
            return faCode;

        default:
            return faQuestion;
    }
}
