import classNames from "classnames";
import { InputHTMLAttributes, ReactNode, useEffect, useRef } from "react";
import inputClasses from "../Input/inputStyles";

type CheckBoxProps = {
    label: ReactNode;

    indeterminate?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** The styled CheckBox component (input type="checkbox"). */
const CheckBox = ({ label, indeterminate = false, className, ...props }: CheckBoxProps) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <label className="relative flex flex-row gap-2 items-center cursor-pointer">
            <input
                {...props}
                type="checkbox"
                className={classNames(
                    className,
                    "w-4 h-4 appearance-none",
                    inputClasses,
                    "after:absolute after:font-extrabold",
                    "checked:after:content-['✓'] checked:after:top-0 checked:after:left-0.5",
                    "indeterminate:after:content-['-'] indeterminate:after:top-0 indeterminate:after:left-[0.3rem]",
                )}
                ref={ref}
            />

            {label}
        </label>
    );
};
export default CheckBox;
