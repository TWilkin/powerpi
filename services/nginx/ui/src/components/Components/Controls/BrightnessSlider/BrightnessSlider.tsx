import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { MouseEvent, useCallback } from "react";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import Slider from "../Slider";

type BrightnessSliderProps = {
    brightness?: number;
} & AdditionalStateControlsProps;

const BrightnessSlider = ({ brightness = 65535, disabled, onChange }: BrightnessSliderProps) => {
    const onBrightnessChange = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            event.preventDefault();

            const target = event.target as HTMLInputElement;
            const newBrightness = parseInt(target.value);
            if (newBrightness !== brightness) {
                onChange({ brightness: newBrightness });
            }
        },
        [brightness, onChange]
    );

    return (
        <Slider title="Set the brightness for this device" lowIcon={faMoon} highIcon={faSun}>
            <input
                type="range"
                min={0}
                max={65535}
                defaultValue={brightness}
                disabled={disabled}
                onMouseOut={onBrightnessChange}
            />
        </Slider>
    );
};
export default BrightnessSlider;
