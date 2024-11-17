import { Battery } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import Icon, { IconType } from "../Icon";

type BatteryIconProps = {
    device: Battery;
};

/** Icon for the battery level/charging state of a device or sensor. */
const BatteryIcon = ({ device }: BatteryIconProps) => {
    const icon: IconType | undefined = useMemo(() => {
        if (device.battery != null) {
            if (device.battery <= 5) {
                return "batteryEmpty";
            }

            if (device.battery <= 25) {
                return "batteryQuarter";
            }

            if (device.battery <= 50) {
                return "batteryHalf";
            }

            if (device.battery <= 75) {
                return "batteryThreeQuarters";
            }

            return "batteryFull";
        }

        return undefined;
    }, [device.battery]);

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
                "text-orange-600": device.battery! <= 25 && device.battery! > 10,
                "text-red-600": device.battery! <= 10,
            })}
        />
    );
};
export default BatteryIcon;
