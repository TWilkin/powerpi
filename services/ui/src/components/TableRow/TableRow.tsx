import { HTMLAttributes } from "react";

type TableRow = Omit<HTMLAttributes<HTMLTableRowElement>, "className">;

const TableRow = ({ children, ...props }: TableRow) => (
    <tr {...props} className="bg-transparent odd:bg-sky-200 odd:dark:bg-purple-950">
        {children}
    </tr>
);
export default TableRow;
