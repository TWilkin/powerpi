import {
    ChangeEvent,
    FocusEvent,
    InputHTMLAttributes,
    MouseEvent,
    TouchEvent,
    useCallback,
    useMemo,
} from "react";
import Icon, { IconType } from "../Icon";
import { inputStyles } from "../Input";

type SliderProps = {
    lowIcon: IconType;

    highIcon: IconType;

    label: string;

    min: number;

    max: number;

    value: number;

    onChange(value: number): void;

    /** When the user has stopped changing the value so we can send a request. */
    onSettled(value: number): void;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "label" | "min" | "max" | "value" | "onChange"
>;

/** Component representing a numeric input between two values using a range slider. */
const Slider = ({
    lowIcon,
    highIcon,
    label,
    min,
    max,
    value,
    onChange,
    onSettled,
    ...props
}: SliderProps) => {
    const valuePosition = useMemo(() => {
        const ratio = (max - min) / 100;
        return ratio * value - 1;
    }, [max, min, value]);

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = parseInt(event.target.value);
            onChange(newValue);
        },
        [onChange],
    );

    const handleSettled = useCallback(
        (
            event:
                | MouseEvent<HTMLInputElement>
                | TouchEvent<HTMLInputElement>
                | FocusEvent<HTMLInputElement>,
        ) => {
            event.preventDefault();

            const target = event.target as HTMLInputElement;
            const newValue = parseInt(target.value);
            if (newValue !== value) {
                onSettled(newValue);
            }
        },
        [onSettled, value],
    );

    return (
        <div className="w-64 flex flex-row justify-between gap-2 flex-1">
            <div className="flex flex-col items-center gap-1">
                <Icon icon={lowIcon} />

                <span className="text-xs">{min}</span>
            </div>

            <div className="relative flex-1">
                <input
                    {...props}
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    className={inputStyles}
                    aria-label={label}
                    onChange={handleChange}
                    onMouseOut={handleSettled}
                    onBlur={handleSettled}
                    onTouchEnd={handleSettled}
                />

                <span className="absolute top-5 text-xs" style={{ left: `${valuePosition}%` }}>
                    {value}
                </span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <Icon icon={highIcon} />

                <span className="text-xs">{max}</span>
            </div>
        </div>
    );
};
export default Slider;
