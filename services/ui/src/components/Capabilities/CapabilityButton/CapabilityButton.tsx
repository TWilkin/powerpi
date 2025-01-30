import { Device } from "@powerpi/common-api";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import Button from "../../Button";
import DeviceIcon from "../../DeviceIcon";
import { useDialog } from "../../Dialog";
import Icon from "../../Icon";
import CapabilityDialogBody from "../CapabilityDialogBody";
import getDeviceCapabilities from "../getDeviceCapabilities";

type CapabilityButtonProps = {
    device: Device;
};

const capabilityClasses = "w-6 h-6 flex justify-center items-center";

/** Either the device's icon, or the device's icon wrapped in a button that will open the capability dialog. */
const CapabilityButton = ({ device }: CapabilityButtonProps) => {
    const { t } = useTranslation();

    const { handleDialogOpen } = useDialog();

    const handleClick = useCallback(() => {
        handleDialogOpen(
            device.display_name ?? device.name,
            <DeviceIcon type={device.type} />,
            <CapabilityDialogBody deviceName={device.name} />,
        );
    }, [device, handleDialogOpen]);

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
            onClick={handleClick}
        >
            <DeviceIcon type={device.type} />

            <Icon icon="capability" className="absolute top-4 left-4 text-2xs" />
        </Button>
    );
};
export default CapabilityButton;
