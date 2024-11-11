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
                icon={changing ? "loading" : "stateOn"}
                className="!bg-green-800"
                aria-label={t("common.power on")}
                onClick={handlePowerOn}
            />

            <Button
                icon={changing ? "loading" : "stateOff"}
                className="!bg-red-800"
                aria-label={t("common.power off")}
                onClick={handlePowerOff}
            />
        </div>
    );
};
export default DevicePowerButton;
