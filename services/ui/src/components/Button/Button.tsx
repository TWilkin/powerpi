import { ButtonHTMLAttributes } from "react";
import Icon, { IconType } from "../Icon";
import "./Button.css";

type ButtonProps = {
    icon?: IconType;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, ...props }: ButtonProps) => (
    <button
        {...props}
        className="flex flex-row justify-center items-center gap-1 button rounded border-2 border-black"
    >
        {children}

        {props.icon && <Icon icon={props.icon} />}
    </button>
);
export default Button;
