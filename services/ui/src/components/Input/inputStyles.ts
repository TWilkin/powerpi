import classNames from "classnames";

const inputClasses = classNames(
    "w-full rounded",
    "bg-sky-400 dark:bg-purple-900 text-black dark:text-white",
    "accent-sky-400 dark:accent-purple-900",
    "hover:bg-sky-300 hover:dark:bg-purple-800",
    "focus:outline-none focus:ring-offset-2 focus:ring-offset-white focus:dark:ring-offset-black focus:ring-2 focus:ring-black focus:dark:ring-white focus:z-10",
    "focus-within:outline-none focus-within:ring-offset-2 focus-within:ring-offset-white focus-within:dark:ring-offset-black focus-within:ring-2 focus-within:ring-black focus-within:dark:ring-white focus-within:z-10",
    "disabled:opacity-50 disabled:cursor-not-allowed",
);

export default inputClasses;
