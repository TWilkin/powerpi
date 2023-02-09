import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import {
    ChangeEvent,
    HTMLProps,
    MouseEvent,
    TouchEvent,
    useCallback,
    useLayoutEffect,
    useState,
} from "react";
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
    const [currentValue, setCurrentValue] = useState(value);

    const onValueChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => setCurrentValue(parseInt(event.target.value)),
        []
    );

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

    useLayoutEffect(() => setCurrentValue(value), [value]);

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
                value={currentValue}
                disabled={disabled}
                onChange={onValueChange}
                onMouseOut={onValueSettled}
                onTouchEnd={onValueSettled}
                className={classNames({ [styles.custom]: inputProps?.style })}
                {...inputProps}
            />

            <FontAwesomeIcon icon={highIcon} />
        </div>
    );
};
export default Slider;
