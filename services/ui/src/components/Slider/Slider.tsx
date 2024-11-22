import classNames from "classnames";
import {
    ChangeEvent,
    FocusEvent,
    InputHTMLAttributes,
    MouseEvent,
    TouchEvent,
    useCallback,
    useMemo,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SupportedUnitLabel } from "../../services/UnitConverter";
import getTextWidth from "../../utils/getTextWidth";
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

    unit: SupportedUnitLabel;

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

    // using a ref so the memo re-runs when it becomes assigned
    const [ref, setRef] = useState<HTMLSpanElement | null>(null);

    const { valuePosition, valueText, valueMargin } = useMemo(() => {
        const ratio = (max - min) / 100;
        const valuePosition = (value - min - 1) / ratio;

        const valueText = t(`common.units.values.${unit}`, { value });

        const width = ref ? getTextWidth(ref, valueText) : 0;
        const valueMargin = (width / 2) * -1;

        return {
            valuePosition,
            valueText,
            valueMargin,
        };
    }, [max, min, ref, t, unit, value]);

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
        <>
            <div className="flex flex-col items-center gap-1">
                <Icon icon={lowIcon} />

                <span className="text-xs">{t(`common.units.values.${unit}`, { value: min })}</span>
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
                        "h-2 !w-64 mt-1 rounded appearance-none cursor-pointer !bg-transparent",
                        "disabled:!opacity-100",
                    )}
                    disabled={disabled}
                    aria-label={label}
                    onChange={handleChange}
                    onMouseOut={handleSettled}
                    onBlur={handleSettled}
                    onTouchEnd={handleSettled}
                />

                <span
                    className="absolute top-5 text-xs"
                    style={{ left: `${valuePosition}%`, marginLeft: `${valueMargin}px` }}
                    ref={setRef}
                >
                    {valueText}
                </span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <Icon icon={highIcon} />

                <span className="text-xs">{t(`common.units.values.${unit}`, { value: max })}</span>
            </div>
        </>
    );
};
export default Slider;
