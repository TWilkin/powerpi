import { Device, DeviceState } from "@powerpi/common-api";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDeviceChangingState } from "../../queries/notifications";
import useMutateDeviceState from "../../queries/useMutateDeviceState";
import Button from "../Button";

type DevicePowerButtonProps = {
    device: Device;
};

const DevicePowerButton = ({ device }: DevicePowerButtonProps) => {
    const { t } = useTranslation();

    const { mutateAsync } = useMutateDeviceState(device);
    const { changingState } = useDeviceChangingState();

    const changing = useMemo(
        () => changingState && changingState[device.name],
        [changingState, device.name],
    );

    const handlePowerOn = useCallback(() => mutateAsync(DeviceState.On), [mutateAsync]);
    const handlePowerOff = useCallback(() => mutateAsync(DeviceState.Off), [mutateAsync]);

    return (
        <div className="flex flex-row">
            <Button
                buttonType="on"
                icon={changing ? "loading" : "stateOn"}
                aria-label={t("common.power on")}
                onClick={handlePowerOn}
            />

            <Button
                buttonType="off"
                icon={changing ? "loading" : "stateOff"}
                aria-label={t("common.power off")}
                onClick={handlePowerOff}
            />
        </div>
    );
};
export default DevicePowerButton;
