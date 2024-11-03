import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = (props: ButtonProps) => (
    <button
        {...props}
        className="font-semibold p-2 rounded bg-sky-100 text-black dark:bg-purple-900 dark:text-white"
    />
);
export default Button;
