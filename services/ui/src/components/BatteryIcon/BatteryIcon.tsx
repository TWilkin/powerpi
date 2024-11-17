import { Battery } from "@powerpi/common-api";
import classNames from "classnames";
import Icon from "../Icon";
import useBatteryIcon from "./useBatteryIcon";

type BatteryIconProps = {
    device: Battery;
};

/** Icon for the battery level/charging state of a device or sensor. */
const BatteryIcon = ({ device }: BatteryIconProps) => {
    const icon = useBatteryIcon(device.battery, device.charging);

    if (!icon) {
        return <></>;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const outdated = device.batterySince! <= weekAgo.getTime();

    return (
        <Icon
            icon={icon}
            className={classNames("-rotate-90", {
                "opacity-50": outdated,
                "text-orange-600":
                    !device.charging && device.battery! <= 25 && device.battery! > 10,
                "text-red-600": !device.charging && device.battery! <= 10,
            })}
        />
    );
};
export default BatteryIcon;
