import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
import { omit } from "underscore";
import Icon, { IconType } from "../Icon";
import buttonStyles, { ButtonType } from "./buttonStyles";

type ButtonProps = {
    type?: ButtonType;

    icon?: IconType;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

const Button = ({ type = "default", children, ...props }: ButtonProps) => (
    <button
        {...omit(props, "icon")}
        className={classNames(
            buttonStyles(type),
            "flex flex-row justify-center items-center gap-1 rounded border-2 border-black",
        )}
    >
        {children}

        {props.icon && <Icon icon={props.icon} />}
    </button>
);
export default Button;
