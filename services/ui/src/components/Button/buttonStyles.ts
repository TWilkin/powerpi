import classNames from "classnames";

const buttonClasses = classNames(
    "font-semibold",
    "focus:outline-none focus:ring-offset-2 focus:ring-offset-outline-offset focus:ring-2 focus:ring-outline focus:z-10",
    "disabled:opacity-50",
);

export type ButtonType = "default" | "clear" | "icon" | "on" | "off";

const defaultTypeClasses = "bg-bg-primary hover:bg-bg-hover active:bg-bg-active";

const clearTypeClasses = "bg-transparent";

const onTypeClasses = "bg-green-800 hover:bg-green-700 active:bg-green-600";

const offTypeClasses = "bg-red-800 hover:bg-red-700 active:bg-red-600";

const normalSizeClasses = "p";
const smallSizeClasses = "p-sm text-sm";
const xSmallSizeClasses = "p-xs text-sm";

export default function buttonStyles(type: ButtonType) {
    return classNames(buttonClasses, {
        [normalSizeClasses]: type === "default",
        [smallSizeClasses]: type === "on" || type === "off",
        [xSmallSizeClasses]: type === "icon",
        [defaultTypeClasses]: type === "default" || type === "icon",
        [clearTypeClasses]: type === "clear",
        [onTypeClasses]: type === "on",
        [offTypeClasses]: type === "off",
    });
}
