import { faTemperatureEmpty, faTemperatureFull } from "@fortawesome/free-solid-svg-icons";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import Slider from "../Slider";

type ColourTemperatureSliderProps = {
    temperature?: number;
    min: number;
    max: number;
} & AdditionalStateControlsProps;

const ColourTemperatureSlider = ({
    temperature = 2500,
    min,
    max,
    disabled,
    onChange,
}: ColourTemperatureSliderProps) => (
    <Slider
        title="Set the colour temperature for this device"
        lowIcon={faTemperatureEmpty}
        highIcon={faTemperatureFull}
        additionalStateName="temperature"
        value={temperature}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onChange}
    />
);

export default ColourTemperatureSlider;
