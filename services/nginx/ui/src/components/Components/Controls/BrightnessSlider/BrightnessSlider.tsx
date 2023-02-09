import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import Slider from "../Slider";

type BrightnessSliderProps = {
    brightness?: number;
} & AdditionalStateControlsProps;

const BrightnessSlider = ({ brightness = 65535, disabled, onChange }: BrightnessSliderProps) => (
    <Slider
        title="Set the brightness for this device"
        lowIcon={faMoon}
        highIcon={faSun}
        additionalStateName="brightness"
        value={brightness}
        min={0}
        max={65535}
        disabled={disabled}
        onChange={onChange}
    />
);

export default BrightnessSlider;
