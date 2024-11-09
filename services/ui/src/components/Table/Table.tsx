import { TableHTMLAttributes } from "react";

type TableProps = Omit<TableHTMLAttributes<HTMLTableElement>, "className">;

const Table = ({ children, ...props }: TableProps) => (
    <table {...props} className="m-auto">
        {children}
    </table>
);
export default Table;
