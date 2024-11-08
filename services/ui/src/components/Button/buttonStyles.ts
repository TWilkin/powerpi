import { classNames } from "../../util";

const buttonClasses = `
    font-semibold
    p-2
    bg-sky-400 text-black dark:bg-purple-900 dark:text-white
    hover:bg-sky-300 hover:dark:bg-purple-800
    focus:outline-none focus:ring-offset-2 focus:ring-offset-white focus:dark:ring-offset-black focus:ring-2 focus:ring-black focus:dark:ring-white
    disabled:opacity-50
    active:bg-sky-200 active:dark:bg-purple-700
`;

export default function buttonStyles(active = false) {
    return classNames(buttonClasses, { "bg-sky-200 dark:bg-purple-700": active });
}
