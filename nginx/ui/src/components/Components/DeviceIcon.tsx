import {
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
import React from "react";

interface DeviceIconProps {
    type: string;
}

const DeviceIcon = ({ type }: DeviceIconProps) => {
    return (
        <div className="device-icon">
            <FontAwesomeIcon icon={getDeviceTypeIcon(type)} />
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

                default:
                    return faQuestion;
            }
    }
}
