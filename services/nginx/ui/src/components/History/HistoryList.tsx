import { History } from "@powerpi/api";
import { useEffect, useMemo } from "react";
import { chain as _ } from "underscore";
import { useGetHistory, useInvalidateHistory } from "../../hooks/history";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import Filter from "../Components/Filter";
import InfiniteScrollList from "../Components/InfiniteScrollList";
import Message from "../Components/Message";
import HistoryFilter from "./HistoryFilter";
import styles from "./HistoryList.module.scss";
import useHistoryFilter from "./useHistoryFilter";

const HistoryList = () => {
    const {
        filters,
        onClear,
        onStartDateFilterChange,
        onEndDateFilterChange,
        onMessageTypeFilterChange,
    } = useHistoryFilter();

    const records = 30;

    const { isHistoryError, history, historyFetchNextPage, hasHistoryNextPage } = useGetHistory(
        records,
        filters.start ?? undefined,
        filters.end ?? undefined,
        filters.type !== "" ? filters.type : undefined,
        filters.entity !== "" ? filters.entity : undefined,
        filters.action !== "" ? filters.action : undefined
    );

    const historyCache = useMemo(
        () =>
            _(history?.pages?.reduce((acc, page) => acc.concat(page?.data ?? []), [] as History[]))
                .uniq((record) => JSON.stringify(record))
                .value(),
        [history?.pages]
    );

    // when the filters change invalidate the history we have loaded
    const invalidateHistory = useInvalidateHistory();
    useEffect(() => {
        invalidateHistory();
    }, [filters, invalidateHistory]);

    return (
        <>
            <Filter onClear={onClear}>
                <HistoryFilter
                    filters={filters}
                    onStartDateFilterChange={onStartDateFilterChange}
                    onEndDateFilterChange={onEndDateFilterChange}
                    onMessageTypeFilterChange={onMessageTypeFilterChange}
                />
            </Filter>

            <div className={styles.list}>
                <InfiniteScrollList
                    hasMore={hasHistoryNextPage ?? false}
                    loadMore={historyFetchNextPage}
                >
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
                            {historyCache.length > 0 ? (
                                historyCache.map((row, i) => (
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
                                        {isHistoryError ? (
                                            <Message
                                                error
                                                message="An error occurred loading the history."
                                            />
                                        ) : (
                                            <Message message="No history." />
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </InfiniteScrollList>
            </div>
        </>
    );
};
export default HistoryList;
