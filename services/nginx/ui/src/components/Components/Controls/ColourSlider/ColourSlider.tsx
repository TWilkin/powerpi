import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCircleHalfStroke, faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { PropsWithChildren, useCallback, useLayoutEffect, useState } from "react";
import { ColorResult, CustomPicker, InjectedColorProps } from "react-color";
import { Hue, Saturation } from "react-color/lib/components/common";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import styles from "./ColourSlider.module.scss";

type ColourSliderProps = {
    hue?: number;
    saturation?: number;
    brightness?: number;
} & AdditionalStateControlsProps;

const ColourSlider = ({
    hue = 360,
    saturation = 100,
    brightness = 65535,
    disabled,
    onChange,
}: ColourSliderProps) => {
    const [colour, setColour] = useState({ h: hue, s: saturation / 100, l: brightness / 65535 });

    const onColourChange = useCallback((color: ColorResult) => setColour({ ...color.hsl }), []);

    const onColourChangeComplete = useCallback(
        (color: ColorResult) => {
            const message = {
                hue: +color.hsl.h.toFixed(2),
                saturation: +(color.hsl.s * 100).toFixed(2),
                brightness: +(color.hsl.l * 65535).toFixed(2),
            };

            onChange(message);
        },
        [onChange]
    );

    useLayoutEffect(
        () => setColour({ h: hue, s: saturation / 100, l: brightness / 65535 }),
        [brightness, hue, saturation]
    );

    return (
        <ColourPicker
            color={colour}
            disabled={disabled}
            onChange={onColourChange}
            onChangeComplete={onColourChangeComplete}
        />
    );
};
export default ColourSlider;

type ColourPickerProps = { disabled: boolean } & InjectedColorProps;

const ColourPicker = CustomPicker(({ disabled, onChange, ...passthrough }: ColourPickerProps) => {
    const onColourChange = useCallback(
        (color: ColorResult) => {
            if (disabled || !onChange) {
                return;
            }

            onChange(color);
        },
        [disabled, onChange]
    );

    return (
        <>
            <Slider icon={faPalette} title="Set the hue for this device" disabled={disabled}>
                <Hue {...passthrough} onChange={onColourChange} direction="horizontal" />
            </Slider>

            <Slider
                icon={faCircleHalfStroke}
                title="Set the saturation for this device"
                disabled={disabled}
                box
            >
                <Saturation {...passthrough} onChange={onColourChange} />
            </Slider>
        </>
    );
});

type SliderProps = PropsWithChildren<{
    icon: IconProp;
    title: string;
    disabled: boolean;
    box?: boolean;
}>;

const Slider = ({ icon, title, disabled, box = false, children }: SliderProps) => (
    <div className={classNames(styles.wrapper, { [styles.disabled]: disabled })} title={title}>
        <FontAwesomeIcon icon={icon} />

        <div className={classNames({ [styles.slider]: !box, [styles.box]: box })}>{children}</div>
    </div>
);
