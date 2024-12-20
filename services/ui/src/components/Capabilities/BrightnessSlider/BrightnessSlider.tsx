import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider from "../../Slider";
import CapabilityControlProps from "../CapabilityControlProps";

type BrightnessSliderProps = CapabilityControlProps;

/** A slider to update the brightness value of a device. */
const BrightnessSlider = ({ device, disabled, mutateAsync }: BrightnessSliderProps) => {
    const { t } = useTranslation();

    const [brightness, setBrightness] = useState(device.additionalState?.brightness ?? 0);

    const handleSettled = useCallback(
        (brightness: number) => mutateAsync({ newAdditionalState: { brightness } }),
        [mutateAsync],
    );

    return (
        <Slider
            defaultValue={device.additionalState?.brightness ?? 0}
            value={brightness}
            min={0}
            max={100}
            unit="percentage"
            label={t("common.capability.brightness", { device: device.display_name })}
            lowIcon="brightnessLow"
            highIcon="brightnessHigh"
            disabled={disabled}
            onChange={setBrightness}
            onSettled={handleSettled}
        />
    );
};
export default BrightnessSlider;
