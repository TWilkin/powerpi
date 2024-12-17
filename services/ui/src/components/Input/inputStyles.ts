import classNames from "classnames";

const inputClasses = classNames(
    "rounded",
    "bg-bg-primary placeholder:text-placeholder hover:bg-bg-hover accent-bg-primary",
    "focus:outline-none focus:ring-offset focus:ring-offset-outline-offset focus:ring focus:ring-outline focus:z-10",
    "focus-within:outline-none focus-within:ring-offset focus-within:ring-offset-outline-offset focus-within:ring focus-within:ring-outline focus-within:z-10",
    "disabled:opacity-50 disabled:cursor-not-allowed",
);

export default inputClasses;
