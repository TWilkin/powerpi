import { useMemo } from "react";
import useMutateDeviceState from "../../../queries/useMutateDeviceState";
import useQueryDevices from "../../../queries/useQueryDevices";
import DevicePowerToggle from "../../DevicePowerToggle";
import BrightnessSlider from "../BrightnessSlider";
import ColourTemperatureSlider from "../ColourTemperatureSlider";
import getDeviceCapabilities from "../getDeviceCapabilities";
import StreamSelector from "../StreamSelector";

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

    const { capabilities, temperatureRange, streams } = useMemo(
        () => getDeviceCapabilities(device),
        [device],
    );

    return (
        <div className="grid grid-cols-[1fr_auto_1fr] auto-rows-auto gap-2 justify-items-center">
            <div className="col-span-3">
                <DevicePowerToggle device={device} />
            </div>

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

            {capabilities.streams && (
                <StreamSelector
                    device={device}
                    streams={streams}
                    disabled={isPending}
                    mutateAsync={mutateAsync}
                />
            )}
        </div>
    );
};
export default CapabilityDialogBody;
