import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { MouseEvent } from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
    text?: string;
    icon?: IconProp;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

const Button = ({ text, icon, onClick, className }: ButtonProps) => {
    return (
        <button
            className={classNames(
                styles.button,
                {
                    [styles.text]: text !== undefined,
                },
                className
            )}
            onClick={onClick}
        >
            {icon && <FontAwesomeIcon icon={icon} />}

            {text}
        </button>
    );
};
export default Button;
