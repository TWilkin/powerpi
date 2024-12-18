import { History } from "@powerpi/common-api";
import TableCell from "../../components/TableCell";
import TableRow from "../../components/TableRow";
import Time from "../../components/Time";

type HistoryRowProps = {
    row: History;
};

const HistoryRow = ({ row }: HistoryRowProps) => (
    <TableRow>
        <TableCell>{row.type}</TableCell>

        <TableCell>{row.entity}</TableCell>

        <TableCell>{row.action}</TableCell>

        <TableCell>{row.timestamp && <Time time={new Date(row.timestamp).getTime()} />}</TableCell>

        <TableCell>{JSON.stringify(row.message)}</TableCell>
    </TableRow>
);
export default HistoryRow;
