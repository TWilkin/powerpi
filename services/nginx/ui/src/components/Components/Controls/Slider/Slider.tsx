import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { HTMLProps, MouseEvent, TouchEvent, useCallback } from "react";
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
    inputProps?: HTMLProps<HTMLInputElement>;
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
    inputProps,
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
        <div
            className={classNames(styles.container, { [styles.disabled]: disabled })}
            title={title}
        >
            <FontAwesomeIcon icon={lowIcon} />

            <input
                type="range"
                min={min}
                max={max}
                defaultValue={value}
                disabled={disabled}
                onMouseOut={onValueSettled}
                onTouchEnd={onValueSettled}
                {...inputProps}
            />

            <FontAwesomeIcon icon={highIcon} />
        </div>
    );
};
export default Slider;
