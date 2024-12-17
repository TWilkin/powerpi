import { Device, DeviceState } from "@powerpi/common-api";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useMutateDeviceState from "../../queries/useMutateDeviceState";
import Button from "../Button";

type DevicePowerButtonProps = {
    device: Device;

    onPowerChange?: () => void;
};

const DevicePowerButton = ({ device, onPowerChange }: DevicePowerButtonProps) => {
    const { t } = useTranslation();

    const isLock = useMemo(() => device.type.endsWith("pairing"), [device.type]);

    const { mutateAsync } = useMutateDeviceState(device);

    const handlePowerChange = useCallback(
        async (newState: DeviceState.On | DeviceState.Off) => {
            await mutateAsync({ newState });

            if (onPowerChange) {
                onPowerChange();
            }
        },
        [mutateAsync, onPowerChange],
    );

    const handlePowerOn = useCallback(() => handlePowerChange(DeviceState.On), [handlePowerChange]);

    const handlePowerOff = useCallback(
        () => handlePowerChange(DeviceState.Off),
        [handlePowerChange],
    );

    return (
        <div className="flex flex-row">
            <Button
                buttonType={isLock ? "unlock" : "on"}
                icon={isLock ? "stateUnlocked" : "stateOn"}
                aria-label={t(`common.${isLock ? "lock" : "power"} on`, {
                    device: device.display_name,
                })}
                onClick={handlePowerOn}
            />

            <Button
                buttonType={isLock ? "lock" : "off"}
                icon={isLock ? "stateLocked" : "stateOff"}
                aria-label={t(`common.${isLock ? "lock" : "power"} off`, {
                    device: device.display_name,
                })}
                onClick={handlePowerOff}
            />
        </div>
    );
};
export default DevicePowerButton;
