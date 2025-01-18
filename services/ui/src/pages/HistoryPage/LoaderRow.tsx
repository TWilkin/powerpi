import Loader from "../../components/Loader";
import TableRow from "../../components/TableRow";

type LoaderRowProps = { index: number };

const LoaderRow = ({ index }: LoaderRowProps) => (
    <TableRow index={index}>
        <td colSpan={5}>
            <div className="flex flex-col items-center">
                <Loader />
            </div>
        </td>
    </TableRow>
);
export default LoaderRow;
