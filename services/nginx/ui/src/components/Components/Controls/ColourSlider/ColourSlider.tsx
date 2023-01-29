/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCircleHalfStroke, faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";
import { ColorResult, CustomPicker, InjectedColorProps } from "react-color";
import { Hue, Saturation } from "react-color/lib/components/common";
import AdditionalStateControlsProps from "../AdditionalStateControlProps";
import styles from "./ColourSlider.module.scss";

type ColourSliderProps = {
    hue?: number;
    saturation?: number;
} & AdditionalStateControlsProps;

const ColourSlider = ({ hue = 360, saturation = 100, disabled, onChange }: ColourSliderProps) => {
    const [colour, setColour] = useState({ h: hue, s: saturation, l: 100 });

    const onColourChange = useCallback((color: ColorResult) => setColour({ ...color.hsl }), []);

    const onColourChangeComplete = useCallback(
        (color: ColorResult) => {
            const message = {
                hue: Math.round(color.hsl.h),
                saturation: Math.round(color.hsl.s * 100),
                brightness: Math.round(color.hsl.l * 65535),
            };

            onChange(message);
        },
        [onChange]
    );

    return (
        <ColourPicker
            color={colour}
            onChange={onColourChange}
            onChangeComplete={onColourChangeComplete}
        />
    );
};
export default ColourSlider;

const ColourPicker = CustomPicker((props: InjectedColorProps) => {
    return (
        <>
            <Slider icon={faPalette}>
                <Hue {...props} onChange={props.onChange!} direction="horizontal" />
            </Slider>

            <Slider icon={faCircleHalfStroke} box>
                <Saturation {...props} onChange={props.onChange!} />
            </Slider>
        </>
    );
});

type SliderProps = PropsWithChildren<{
    icon: IconProp;
    box?: boolean;
}>;

const Slider = ({ icon, box = false, children }: SliderProps) => (
    <div className={styles.wrapper}>
        <FontAwesomeIcon icon={icon} />

        <div className={classNames({ [styles.slider]: !box, [styles.box]: box })}>{children}</div>
    </div>
);
