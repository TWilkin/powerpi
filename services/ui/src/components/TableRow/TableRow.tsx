import classNames from "classnames";
import { HTMLAttributes } from "react";
import { omit } from "underscore";

type TableHeaderRow = {
    header: true;
};

type TableBodyRow = {
    header?: false;

    index: number;
};

type TableRow = Omit<HTMLAttributes<HTMLTableRowElement>, "className"> &
    (TableHeaderRow | TableBodyRow);

const TableRow = ({ children, ...props }: TableRow) => (
    <tr
        {...omit(props, "header", "index")}
        className={classNames("h-8", {
            "sticky top-0 bg-bg z-10": props.header,
            "bg-transparent": !props.header && props.index % 2 === 0,
            "bg-bg-zebra": !props.header && props.index % 2 === 1,
        })}
    >
        {children}
    </tr>
);
export default TableRow;
