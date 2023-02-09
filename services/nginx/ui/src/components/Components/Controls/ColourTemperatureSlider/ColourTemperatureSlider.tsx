import { faTemperatureEmpty, faTemperatureFull } from "@fortawesome/free-solid-svg-icons";
import { colorTemperature2rgb } from "color-temperature";
import { useMemo } from "react";
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
}: ColourTemperatureSliderProps) => {
    const style = useMemo(() => ({ background: generateGradient(min, max, 20) }), [max, min]);

    return (
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
            inputProps={{ style }}
        />
    );
};

export default ColourTemperatureSlider;

function generateGradient(min: number, max: number, intervals: number) {
    const range = max - min;
    const increment = range / intervals;
    const percentageIncrement = 100 / intervals;

    const colours = [];

    for (
        let kelvin = min, percent = 0;
        kelvin <= max;
        kelvin += increment, percent += percentageIncrement
    ) {
        const { red, green, blue } = colorTemperature2rgb(kelvin);

        colours.push(`rgb(${red}, ${green}, ${blue}) ${percent}%`);
    }

    return `linear-gradient(to right, ${colours.join()})`;
}
