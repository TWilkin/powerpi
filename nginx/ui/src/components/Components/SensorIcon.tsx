import {
    faBolt,
    faBurn,
    faDoorOpen,
    faHome,
    faQuestion,
    faThermometerHalf,
    faTint,
    faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SensorIconProps {
    type: string;
}

const SensorIcon = ({ type }: SensorIconProps) => <FontAwesomeIcon icon={mapSensorIcon(type)} />;
export default SensorIcon;

function mapSensorIcon(type: string) {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split.at(0) ?? type : type;
    const sensorType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    switch (sensorType) {
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

        case "temperature":
            return faThermometerHalf;

        case "window":
            return faHome;

        default:
            return faQuestion;
    }
}
