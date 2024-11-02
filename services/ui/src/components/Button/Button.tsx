import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => (
    <button
        {...props}
        className="font-semibold p-2 rounded bg-sky-400 text-black dark:bg-purple-950 dark:text-white"
    />
);
