import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
import { omit } from "underscore";
import Icon, { IconType } from "../Icon";
import buttonStyles, { ButtonType } from "./buttonStyles";

type ButtonProps = {
    buttonType?: ButtonType;

    icon?: IconType;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const Button = ({ buttonType: colour = "default", children, ...props }: ButtonProps) => (
    <button
        {...omit(props, "icon")}
        className={classNames(
            buttonStyles(colour),
            "flex flex-row justify-center items-center gap-1 rounded border-2 border-black",
        )}
    >
        {children}

        {props.icon && <Icon icon={props.icon} />}
    </button>
);
export default Button;
