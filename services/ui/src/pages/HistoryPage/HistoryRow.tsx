import { History } from "@powerpi/common-api";
import TableCell from "../../components/TableCell";
import TableRow from "../../components/TableRow";
import Time from "../../components/Time";

type HistoryRowProps = {
    row: History;

    height: number;
};

const HistoryRow = ({ row, height }: HistoryRowProps) => (
    <TableRow style={{ height }}>
        <TableCell>{row.type}</TableCell>

        <TableCell>{row.entity}</TableCell>

        <TableCell>{row.action}</TableCell>

        <TableCell width="time">
            {row.timestamp && <Time time={new Date(row.timestamp).getTime()} />}
        </TableCell>

        <TableCell className="font-mono text-sm">{JSON.stringify(row.message)}</TableCell>
    </TableRow>
);
export default HistoryRow;
