import classNames from "classnames";
import { HTMLAttributes } from "react";

type TableRow = {
    header?: boolean;
} & Omit<HTMLAttributes<HTMLTableRowElement>, "className">;

const TableRow = ({ header = false, children, ...props }: TableRow) => (
    <tr
        {...props}
        className={classNames("h-8", {
            "bg-transparent odd:bg-bg-zebra": !header,
            "sticky top-0 bg-bg": header,
        })}
    >
        {children}
    </tr>
);
export default TableRow;
