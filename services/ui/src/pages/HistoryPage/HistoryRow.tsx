import { History } from "@powerpi/common-api";
import TableCell from "../../components/TableCell";
import TableRow from "../../components/TableRow";
import Time from "../../components/Time";

type HistoryRowProps = {
    row: History;

    height: number;

    offset: number;
};

const HistoryRow = ({ row, height, offset }: HistoryRowProps) => (
    <TableRow style={{ height, transform: `translateY(${offset}px)` }}>
        <TableCell>{row.type}</TableCell>

        <TableCell>{row.entity}</TableCell>

        <TableCell>{row.action}</TableCell>

        <TableCell>{row.timestamp && <Time time={new Date(row.timestamp).getTime()} />}</TableCell>

        <TableCell>
            <pre className="font-mono text-sm">{JSON.stringify(row.message)}</pre>
        </TableCell>
    </TableRow>
);
export default HistoryRow;
