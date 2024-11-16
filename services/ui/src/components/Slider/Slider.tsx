import classNames from "classnames";
import {
    ChangeEvent,
    FocusEvent,
    InputHTMLAttributes,
    MouseEvent,
    TouchEvent,
    useCallback,
    useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import Resources from "../../@types/resources";
import Icon, { IconType } from "../Icon";
import { inputStyles } from "../Input";

type SliderProps = {
    lowIcon: IconType;

    highIcon: IconType;

    label: string;

    min: number;

    max: number;

    defaultValue: number;

    value: number;

    unit: keyof Resources["translation"]["common"]["units"];

    onChange(value: number): void;

    /** When the user has stopped changing the value so we can send a request. */
    onSettled(value: number): void;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "label" | "min" | "max" | "defaultValue" | "value" | "className" | "onChange"
>;

/** Component representing a numeric input between two values using a range slider. */
const Slider = ({
    lowIcon,
    highIcon,
    label,
    min,
    max,
    defaultValue,
    value,
    unit,
    disabled,
    onChange,
    onSettled,
    ...props
}: SliderProps) => {
    const { t } = useTranslation();

    const valuePosition = useMemo(() => {
        const ratio = (max - min) / 100;
        return (value - min - 1) / ratio;
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
            if (newValue !== defaultValue) {
                onSettled(newValue);
            }
        },
        [defaultValue, onSettled],
    );

    return (
        <div
            className={classNames("w-64 flex flex-row justify-between gap-2 flex-1", {
                "opacity-50": disabled,
            })}
        >
            <div className="flex flex-col items-center gap-1">
                <Icon icon={lowIcon} />

                <span className="text-xs">{t(`common.units.${unit}`, { value: min })}</span>
            </div>

            <div className="relative flex flex-col items-center flex-1">
                <input
                    {...props}
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    className={classNames(
                        inputStyles,
                        "h-2 mt-1 rounded appearance-none cursor-pointer !bg-transparent",
                        "disabled:!opacity-100",
                    )}
                    disabled={disabled}
                    aria-label={label}
                    onChange={handleChange}
                    onMouseOut={handleSettled}
                    onBlur={handleSettled}
                    onTouchEnd={handleSettled}
                />

                <span className="absolute top-5 text-xs" style={{ left: `${valuePosition}%` }}>
                    {t(`common.units.${unit}`, { value })}
                </span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <Icon icon={highIcon} />

                <span className="text-xs">{t(`common.units.${unit}`, { value: max })}</span>
            </div>
        </div>
    );
};
export default Slider;
