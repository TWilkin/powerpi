import classNames from "classnames";
import { HTMLAttributes } from "react";

type TableCellProps = {
    width?: "icon" | "button" | "full";
} & Omit<HTMLAttributes<HTMLTableCellElement>, "className">;

const TableCell = ({ width = "full", children, ...props }: TableCellProps) => (
    <td
        {...props}
        className={classNames("min-w-min px-1 truncate hover:whitespace-normal", {
            "w-8": width === "icon",
            "w-20": width === "button",
            "w-full": width === "full",
        })}
    >
        {children}
    </td>
);
export default TableCell;
