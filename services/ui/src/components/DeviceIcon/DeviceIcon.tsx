import { useMemo } from "react";
import Icon, { IconType } from "../Icon";

type DeviceIconProps = {
    type: string;
};

/** An icon representing one of the supported devices. */
const DeviceIcon = ({ type }: DeviceIconProps) => {
    const icon = useMemo(() => getDeviceTypeIcon(type), [type]);

    return <Icon icon={icon} />;
};
export default DeviceIcon;

function getDeviceTypeIcon(type: string): IconType {
    const split = type.split("_");
    const manufacturerType = split.length >= 2 ? split[0] : type;
    const deviceType = split.length >= 2 ? type.substring(manufacturerType.length + 1) : type;

    switch (manufacturerType) {
        case "harmony":
            return "deviceTv";

        case "snapcast":
            if (deviceType === "client") {
                return "deviceMusic";
            }
            break;
    }

    switch (deviceType) {
        case "condition":
            return "deviceCondition";

        case "computer":
            return "deviceComputer";

        case "delay":
            return "deviceDelay";

        case "group":
            return "deviceGroup";

        case "light":
            return "deviceLight";

        case "mutex":
            return "deviceMutex";

        case "pairing":
            return "devicePairing";

        case "scene":
            return "deviceScene";

        case "server":
            return "deviceServer";

        case "socket":
        case "socket_group":
            return "deviceSocket";

        case "variable":
            return "deviceVariable";

        default:
            return "deviceUnknown";
    }
}
