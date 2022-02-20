import { useState } from "react";
import { useGetHistory } from "../../hooks/history";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import Filter from "../Components/Filter";
import List from "../Components/List";
import Loading from "../Components/Loading";
import { MessageTypeFilters } from "../Components/MessageTypeFilter";
import PaginationControls from "../Components/PaginationControls";
import HistoryFilter from "./HistoryFilter";
import styles from "./HistoryList.module.scss";

const HistoryList = () => {
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<MessageTypeFilters>({
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    const records = 30;

    const { isHistoryLoading, isHistoryError, history } = useGetHistory(
        page,
        records,
        filters.type !== "" ? filters.type : undefined,
        filters.entity !== "" ? filters.entity : undefined,
        filters.action !== "" ? filters.action : undefined
    );

    const lastPage = history?.records ? Math.ceil(history.records / records) - 1 : 1;

    return (
        <>
            <Filter>
                <HistoryFilter updateFilter={setFilters} />
            </Filter>

            <div className={styles.list}>
                <Loading loading={isHistoryLoading}>
                    <List>
                        <PaginationControls page={page} lastPage={lastPage} setPage={setPage} />
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Entity</th>
                                    <th>Action</th>
                                    <th>Timestamp</th>
                                    <th>Message</th>
                                </tr>
                            </thead>

                            <tbody>
                                {history?.data && history.data.length > 0 ? (
                                    history?.data.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.type}</td>
                                            <td>{row.entity}</td>
                                            <td>{row.action}</td>
                                            <td>
                                                <AbbreviatingTime date={row.timestamp} />
                                            </td>
                                            <td>{JSON.stringify(row.message)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            {isHistoryError
                                                ? `An error occured when loading the history list`
                                                : `No data`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <PaginationControls page={page} lastPage={lastPage} setPage={setPage} />
                    </List>
                </Loading>
            </div>
        </>
    );
};
export default HistoryList;
