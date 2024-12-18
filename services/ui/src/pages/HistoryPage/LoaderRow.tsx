import Loader from "../../components/Loader";
import TableRow from "../../components/TableRow";

const LoaderRow = () => (
    <TableRow key="loader">
        <td colSpan={5}>
            <div className="flex flex-col items-center">
                <Loader />
            </div>
        </td>
    </TableRow>
);
export default LoaderRow;
