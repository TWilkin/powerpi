import classNames from "classnames";
import { FieldsetHTMLAttributes } from "react";

type FieldSetContentType = "label" | "checkbox";

type FieldSetProps = {
    legend: string;

    content?: FieldSetContentType;
} & FieldsetHTMLAttributes<HTMLFieldSetElement>;

/** Component representing a grouping of elements in a form. */
const FieldSet = ({ legend, content = "label", className, children, ...props }: FieldSetProps) => {
    return (
        <fieldset
            {...props}
            className={classNames(className, "p rounded", "border border-outline", {
                "grid auto-rows-auto grid-cols-[auto_1fr] md:grid-cols-2 gap items-center":
                    content === "label",
            })}
        >
            <legend className="col-span-2 text-lg">{legend}</legend>

            {children}
        </fieldset>
    );
};
export default FieldSet;
