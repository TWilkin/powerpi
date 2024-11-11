import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
import { omit } from "underscore";
import Icon, { IconType } from "../Icon";
import buttonClasses from "./buttonClasses";

type ButtonProps = {
    icon?: IconType;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, className, ...props }: ButtonProps) => (
    <button
        {...omit(props, "icon")}
        className={classNames(
            className,
            buttonClasses,
            "flex flex-row justify-center items-center gap-1 rounded border-2 border-black",
        )}
    >
        {children}

        {props.icon && <Icon icon={props.icon} />}
    </button>
);
export default Button;
