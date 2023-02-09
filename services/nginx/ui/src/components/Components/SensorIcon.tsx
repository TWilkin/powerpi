import {
    faBolt,
    faBurn,
    faDoorOpen,
    faHome,
    faMobileRetro,
    faQuestion,
    faThermometerHalf,
    faTint,
    faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SensorIconProps {
    type: string;
    className?: string;
}

const SensorIcon = ({ type, className }: SensorIconProps) => (
    <FontAwesomeIcon icon={mapSensorIcon(type)} className={className} />
);
export default SensorIcon;

function mapSensorIcon(type: string) {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split.at(0) ?? type : type;
    const sensorType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    let icon = typeSwitch(sensorType);
    for (const str of split) {
        if (icon !== faQuestion) {
            break;
        }

        icon = typeSwitch(str);
    }

    return icon;
}

function typeSwitch(type: string) {
    switch (type) {
        case "door":
            return faDoorOpen;

        case "electricity":
            return faBolt;

        case "gas":
            return faBurn;

        case "humidity":
            return faTint;

        case "motion":
            return faWalking;

        case "switch":
            return faMobileRetro;

        case "temperature":
            return faThermometerHalf;

        case "window":
            return faHome;

        default:
            return faQuestion;
    }
}
