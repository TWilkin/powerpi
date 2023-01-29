import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent, TouchEvent, useCallback } from "react";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import styles from "./Slider.module.scss";

type SliderProps = {
    title: string;
    lowIcon: IconProp;
    highIcon: IconProp;
    additionalStateName: string;
    value: number;
    min: number;
    max: number;
} & AdditionalStateControlsProps;

const Slider = ({
    title,
    lowIcon,
    highIcon,
    additionalStateName,
    value,
    min,
    max,
    disabled,
    onChange,
}: SliderProps) => {
    const onValueSettled = useCallback(
        (event: MouseEvent<HTMLInputElement> | TouchEvent<HTMLInputElement>) => {
            event.preventDefault();

            const target = event.target as HTMLInputElement;
            const newValue = parseInt(target.value);
            if (newValue !== value) {
                const message = { [additionalStateName]: newValue };
                onChange(message);
            }
        },
        [additionalStateName, onChange, value]
    );

    return (
        <div className={styles.container} title={title}>
            <FontAwesomeIcon icon={lowIcon} />

            <input
                type="range"
                min={min}
                max={max}
                defaultValue={value}
                disabled={disabled}
                onMouseOut={onValueSettled}
                onTouchEnd={onValueSettled}
            />

            <FontAwesomeIcon icon={highIcon} />
        </div>
    );
};
export default Slider;
