import {
    faComputer,
    faEquals,
    faLayerGroup,
    faLightbulb,
    faLock,
    faPlug,
    faQuestion,
    faStopwatch,
    faTowerBroadcast,
    faTv,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import Dialog, { useDialog } from "../Dialog";
import styles from "./DeviceIcon.module.scss";

interface DeviceIconProps {
    type: string;
}

const DeviceIcon = ({ type }: DeviceIconProps) => {
    const icon = useMemo(() => getDeviceTypeIcon(type), [type]);

    const { showDialog, closeDialog, toggleDialog } = useDialog();

    return (
        <div className={styles.icon}>
            <FontAwesomeIcon icon={icon} onClick={toggleDialog} className={styles.clickable} />

            {showDialog && (
                <Dialog title="Beep" closeDialog={closeDialog}>
                    Boop
                </Dialog>
            )}
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

                case "computer":
                case "node":
                    return faComputer;

                case "delay":
                    return faStopwatch;

                case "light":
                    return faLightbulb;

                case "mutex":
                    return faLock;

                case "pairing":
                    return faTowerBroadcast;

                case "socket":
                case "socket_group":
                    return faPlug;

                case "variable":
                    return faEquals;

                default:
                    return faQuestion;
            }
    }
}
