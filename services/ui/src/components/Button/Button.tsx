import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
import Icon, { IconType } from "../Icon";
import buttonClasses from "./buttonClasses";

type ButtonProps = {
    icon?: IconType;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, ...props }: ButtonProps) => (
    <button
        {...props}
        className={classNames(
            buttonClasses,
            "flex flex-row justify-center items-center gap-1 rounded border-2 border-black",
        )}
    >
        {children}

        {props.icon && <Icon icon={props.icon} />}
    </button>
);
export default Button;
