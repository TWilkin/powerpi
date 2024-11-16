import { Device, DeviceState } from "@powerpi/common-api";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import useMutateDeviceState from "../../queries/useMutateDeviceState";
import Button from "../Button";

type DevicePowerButtonProps = {
    device: Device;

    onPowerChange?: () => void;
};

const DevicePowerButton = ({ device, onPowerChange }: DevicePowerButtonProps) => {
    const { t } = useTranslation();

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
                buttonType="on"
                icon="stateOn"
                aria-label={t("common.power on", { device: device.display_name })}
                onClick={handlePowerOn}
            />

            <Button
                buttonType="off"
                icon="stateOff"
                aria-label={t("common.power off", { device: device.display_name })}
                onClick={handlePowerOff}
            />
        </div>
    );
};
export default DevicePowerButton;
