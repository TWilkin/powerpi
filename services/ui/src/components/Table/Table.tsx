import classNames from "classnames";
import { TableHTMLAttributes } from "react";

type TableProps = {
    /** Whether the table should grow to fill the space or have a max-width. */
    grow?: boolean;
} & Omit<TableHTMLAttributes<HTMLTableElement>, "className">;

const Table = ({ grow = true, children, ...props }: TableProps) => (
    <table {...props} className={classNames("table-fixed", { "m-auto": grow, "w-full": !grow })}>
        {children}
    </table>
);
export default Table;
