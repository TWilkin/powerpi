import classNames from "classnames";
import { InputHTMLAttributes } from "react";
import inputClasses from "../Input/inputStyles";

type CheckBoxProps = { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** The styled CheckBox component (input type="checkbox"). */
const CheckBox = ({ label, className, ...props }: CheckBoxProps) => {
    return (
        <label className="relative flex flex-row gap-1 items-center cursor-pointer">
            <input
                {...props}
                type="checkbox"
                className={classNames(
                    className,
                    "w-4 h-4 appearance-none",
                    inputClasses,
                    "checked:after:content-['✓'] checked:after:absolute checked:after:top-0 checked:after:left-0.5 checked:after:font-extrabold",
                )}
            />

            {` ${label}`}
        </label>
    );
};
export default CheckBox;
