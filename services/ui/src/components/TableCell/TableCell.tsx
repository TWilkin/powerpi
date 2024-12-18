import classNames from "classnames";
import { HTMLAttributes } from "react";

type TableCellProps = {
    width?: "icon" | "button" | "time" | "full";
} & HTMLAttributes<HTMLTableCellElement>;

const TableCell = ({ width = "full", className, children, ...props }: TableCellProps) => (
    <td
        {...props}
        className={classNames(className, "min-w-min truncate hover:whitespace-normal", {
            "w-8 text-center": width === "icon",
            "w-20": width === "button",
            "w-20 md:w-32": width === "time",
            "w-full": width === "full",
        })}
    >
        {children}
    </td>
);
export default TableCell;
