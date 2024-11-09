import { HTMLAttributes } from "react";

type TableCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, "className">;

const TableCell = ({ children, ...props }: TableCellProps) => (
    <td {...props} className="px-1">
        {children}
    </td>
);
export default TableCell;
