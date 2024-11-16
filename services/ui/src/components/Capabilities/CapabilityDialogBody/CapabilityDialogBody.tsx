import { useMemo } from "react";
import useMutateDeviceState from "../../../queries/useMutateDeviceState";
import useQueryDevices from "../../../queries/useQueryDevices";
import DevicePowerToggle from "../../DevicePowerToggle";
import BrightnessSlider from "../BrightnessSlider";
import ColourTemperatureSlider from "../ColourTemperatureSlider";
import getDeviceCapabilities from "../getDeviceCapabilities";

type CapabilityDialogBody = {
    deviceName: string;
};

const CapabilityDialogBody = ({ deviceName }: CapabilityDialogBody) => {
    const { data } = useQueryDevices();

    const device = useMemo(
        () => data.find((device) => device.name === deviceName)!,
        [data, deviceName],
    );

    const { isPending, mutateAsync } = useMutateDeviceState(device);

    const { capabilities, temperatureRange } = useMemo(
        () => getDeviceCapabilities(device),
        [device],
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <DevicePowerToggle device={device} />

            {capabilities.brightness && (
                <BrightnessSlider device={device} disabled={isPending} mutateAsync={mutateAsync} />
            )}

            {capabilities.temperature && (
                <ColourTemperatureSlider
                    device={device}
                    range={temperatureRange}
                    disabled={isPending}
                    mutateAsync={mutateAsync}
                />
            )}
        </div>
    );
};
export default CapabilityDialogBody;
