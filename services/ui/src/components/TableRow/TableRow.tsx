import { HTMLAttributes } from "react";

type TableRow = Omit<HTMLAttributes<HTMLTableRowElement>, "className">;

const TableRow = ({ children, ...props }: TableRow) => (
    <tr {...props} className="h-8 bg-transparent odd:bg-bg-zebra">
        {children}
    </tr>
);
export default TableRow;
