import { useMemo } from "react";
import Icon, { IconType } from "../Icon";

type SensorIconProps = {
    type: string;

    state?: string;
};

/** An icon representing one of the supported sensors. */
const SensorIcon = ({ type, state }: SensorIconProps) => {
    const icon = useMemo(() => getSensorTypeIcon(type, state), [state, type]);

    return <Icon icon={icon} />;
};
export default SensorIcon;

function getSensorTypeIcon(type: string, state?: string) {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split[0] : type;
    const sensorType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    let icon = typeSwitch(sensorType, state);
    for (const str of split) {
        if (icon !== "sensorUnknown") {
            break;
        }

        icon = typeSwitch(str, state);
    }

    return icon;
}

function typeSwitch(type: string, state?: string): IconType {
    switch (type) {
        case "current":
            return "sensorCurrent";

        case "door":
            return state === "close" ? "sensorDoorClosed" : "sensorDoorOpen";

        case "electricity":
            return "sensorElectricity";

        case "gas":
            return "sensorGas";

        case "humidity":
            return "sensorHumidity";

        case "motion":
            return "sensorMotion";

        case "power":
            return "sensorPower";

        case "switch":
            return "sensorSwitch";

        case "temperature":
            return "sensorTemperature";

        case "voltage":
            return "sensorVoltage";

        case "window":
            return state === "close" ? "sensorWindowClosed" : "sensorWindowOpen";

        default:
            return "sensorUnknown";
    }
}
