import { Device } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import Button from "../../Button";
import DeviceIcon from "../../DeviceIcon";
import Icon from "../../Icon";
import getDeviceCapabilities from "../getDeviceCapabilities";

type CapabilityButtonProps = {
    device: Device;
};

const capabilityClasses = "w-6 h-6 flex justify-center items-center";

/** Either the device's icon, or the device's icon wrapped in a button that will open the capability dialog. */
const CapabilityButton = ({ device }: CapabilityButtonProps) => {
    const { t } = useTranslation();

    const hasCapability = useMemo(() => {
        const { capabilities } = getDeviceCapabilities(device);
        return _(capabilities).any((capability) => capability);
    }, [device]);

    if (!hasCapability) {
        return (
            <div className={capabilityClasses}>
                <DeviceIcon type={device.type} />
            </div>
        );
    }

    return (
        <Button
            buttonType="icon"
            className={classNames(capabilityClasses, "relative")}
            aria-label={t("common.capability.button", { device: device.display_name })}
        >
            <DeviceIcon type={device.type} />

            <Icon icon="capability" size="xs" className="absolute top-4 left-4" />
        </Button>
    );
};
export default CapabilityButton;
