import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import Slider from "../Slider";

type BrightnessSliderProps = {
    brightness?: number;
};

const BrightnessSlider = ({ brightness = 65535 }: BrightnessSliderProps) => (
    <Slider title="Set the brightness for this device" lowIcon={faMoon} highIcon={faSun}>
        <input type="range" min={0} max={65535} value={brightness} />
    </Slider>
);
export default BrightnessSlider;
