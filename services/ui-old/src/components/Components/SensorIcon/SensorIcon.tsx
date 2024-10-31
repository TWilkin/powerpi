import {
    faBolt,
    faBurn,
    faDoorClosed,
    faDoorOpen,
    faHouseChimney,
    faHouseChimneyWindow,
    faMobileRetro,
    faQuestion,
    faThermometerHalf,
    faTint,
    faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

type SensorIconProps = {
    type: string;
    state?: string;
} & Omit<FontAwesomeIconProps, "icon">;

const SensorIcon = ({ type, state, className, ...props }: SensorIconProps) => (
    <FontAwesomeIcon {...props} icon={mapSensorIcon(type, state)} className={className} />
);
export default SensorIcon;

function mapSensorIcon(type: string, state?: string) {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split.at(0) ?? type : type;
    const sensorType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    let icon = typeSwitch(sensorType, state);
    for (const str of split) {
        if (icon !== faQuestion) {
            break;
        }

        icon = typeSwitch(str, state);
    }

    return icon;
}

function typeSwitch(type: string, state?: string) {
    switch (type) {
        case "door":
            return state === "close" ? faDoorClosed : faDoorOpen;

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
            return state === "close" ? faHouseChimney : faHouseChimneyWindow;

        default:
            return faQuestion;
    }
}
