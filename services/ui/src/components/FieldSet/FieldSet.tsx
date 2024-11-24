import classNames from "classnames";
import { FieldsetHTMLAttributes } from "react";

type FieldSetProps = {
    legend: string;
} & FieldsetHTMLAttributes<HTMLFieldSetElement>;

/** Component representing a grouping of elements in a form. */
const FieldSet = ({ legend, className, children, ...props }: FieldSetProps) => {
    return (
        <fieldset
            {...props}
            className={classNames(
                className,
                "p rounded grid auto-rows-auto grid-cols-[auto_1fr] md:grid-cols-2 gap items-center",
                "border-2 border-black dark:border-white",
            )}
        >
            <legend className="col-span-2 text-lg">{legend}</legend>

            {children}
        </fieldset>
    );
};
export default FieldSet;
