import { Device } from "@powerpi/common-api";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useMutateDeviceState from "../../../queries/useMutateDeviceState";
import Slider from "../../Slider";
import getDeviceCapabilities from "../getDeviceCapabilities";
import generateGradient from "./generateGradient";

type ColourSliderProps = {
    device: Device;

    range: ReturnType<typeof getDeviceCapabilities>["temperatureRange"];

    disabled: boolean;

    mutateAsync: ReturnType<typeof useMutateDeviceState>["mutateAsync"];
};

/** A slider to update the brightness value of a device. */
const ColourTemperatureSlider = ({ device, range, disabled, mutateAsync }: ColourSliderProps) => {
    const { t } = useTranslation();

    const [temperature, setTemperature] = useState(device.additionalState?.temperature ?? 0);

    const style = useMemo(
        () => ({ background: generateGradient(range.min, range.max, 20) }),
        [range.max, range.min],
    );

    const handleSettled = useCallback(
        (temperature: number) => mutateAsync({ newAdditionalState: { temperature } }),
        [mutateAsync],
    );

    return (
        <Slider
            defaultValue={device.additionalState?.temperature ?? 0}
            value={temperature}
            min={range.min}
            max={range.max}
            unit="colour temperature"
            label={t("common.capability.colour temperature", { device: device.display_name })}
            lowIcon="colourTemperatureLow"
            highIcon="colourTemperatureHigh"
            disabled={disabled}
            style={style}
            data-colour-slider
            onChange={setTemperature}
            onSettled={handleSettled}
        />
    );
};
export default ColourTemperatureSlider;
