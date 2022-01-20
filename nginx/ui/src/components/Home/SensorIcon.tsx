import {
    faBolt,
    faInfo,
    faThermometerHalf,
    faTint,
    faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface SensorIconProps {
    type: string;
}

const SensorIcon = ({ type }: SensorIconProps) => <FontAwesomeIcon icon={mapSensorIcon(type)} />;
export default SensorIcon;

function mapSensorIcon(type: string) {
    switch (type) {
        case "electricity":
            return faBolt;

        case "gas":
            return "burn";

        case "humidity":
            return faTint;

        case "motion":
            return faWalking;

        case "temperature":
            return faThermometerHalf;

        default:
            return faInfo;
    }
}
