import libClassName, { ArgumentArray } from "classnames";

export default function classNames(...args: ArgumentArray) {
    const classes = libClassName(args);

    return classes.replaceAll(/\s\s+/g, " ");
}
