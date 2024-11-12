import classNames from "classnames";

const buttonClasses = classNames(
    "font-semibold",
    "p-2",
    "text-black dark:text-white",
    "focus:outline-none focus:ring-offset-2 focus:ring-offset-white focus:dark:ring-offset-black focus:ring-2 focus:ring-black focus:dark:ring-white",
    "disabled:opacity-50",
);

export type ButtonType = "default" | "on" | "off";

const defaultTypeClasses =
    "bg-sky-400 dark:bg-purple-900 hover:bg-sky-300 hover:dark:bg-purple-800 active:bg-sky-200 active:dark:bg-purple-700";

const onTypeClasses = "bg-green-800 hover:bg-green-700 active:bg-green-600";

const offTypeClasses = "bg-red-800 hover:bg-red-700 active:bg-red-600";

export default function buttonStyles(type: ButtonType) {
    return classNames(buttonClasses, {
        [defaultTypeClasses]: type === "default",
        [onTypeClasses]: type === "on",
        [offTypeClasses]: type === "off",
    });
}
