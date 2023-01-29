import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren } from "react";
import styles from "./Slider.module.scss";

type SliderProps = PropsWithChildren<{
    title: string;
    lowIcon: IconProp;
    highIcon: IconProp;
}>;

const Slider = ({ title, lowIcon, highIcon, children }: SliderProps) => (
    <div className={styles.container} title={title}>
        <FontAwesomeIcon icon={lowIcon} />

        {children}

        <FontAwesomeIcon icon={highIcon} />
    </div>
);
export default Slider;
