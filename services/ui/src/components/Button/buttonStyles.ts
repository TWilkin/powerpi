import classNames from "classnames";

const buttonClasses = classNames(
    "font-semibold",
    "focus:outline-none focus:ring-offset focus:ring-offset-outline-offset focus:ring focus:ring-outline focus:z-10",
    "disabled:opacity-50",
);

export type ButtonType = "default" | "clear" | "icon" | "on" | "off" | "lock" | "unlock";

const defaultTypeClasses = "bg-bg-primary hover:bg-bg-hover active:bg-bg-active";

const clearTypeClasses = "bg-transparent";

const onTypeClasses = "bg-on hover:bg-on-hover active:bg-on-active text-white";
const offTypeClasses = "bg-off hover:bg-off-hover active:bg-off-active text-white";
const lockTypeClasses = "bg-lock hover:bg-lock-hover active:bg-lock-active text-white";
const unlockTypeClasses = "bg-unlock hover:bg-unlock-hover active:bg-unlock-active text-white";

const normalSizeClasses = "p";
const smallSizeClasses = "p-sm text-sm";
const xSmallSizeClasses = "p-xs text-sm";

export default function buttonStyles(type: ButtonType) {
    return classNames(buttonClasses, {
        [normalSizeClasses]: type === "default",
        [smallSizeClasses]: type === "on" || type === "off" || type == "lock" || type == "unlock",
        [xSmallSizeClasses]: type === "icon",
        [defaultTypeClasses]: type === "default" || type === "icon",
        [clearTypeClasses]: type === "clear",
        [onTypeClasses]: type === "on",
        [offTypeClasses]: type === "off",
        [lockTypeClasses]: type === "lock",
        [unlockTypeClasses]: type === "unlock",
    });
}
