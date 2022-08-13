import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent } from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
    text: string;
    icon?: IconProp;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({ text, icon, onClick }: ButtonProps) => {
    return (
        <button className={styles.button} onClick={onClick}>
            {icon && <FontAwesomeIcon icon={icon} />}

            {text}
        </button>
    );
};
export default Button;
