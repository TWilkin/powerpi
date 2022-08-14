import { History } from "@powerpi/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chain as _ } from "underscore";
import { useGetHistory } from "../../hooks/history";
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

    const [lastDate, setLastDate] = useState<Date | undefined>(filters.end);

    const records = 30;

    const { isHistoryLoading, isHistoryError, history } = useGetHistory(
        records,
        filters.start,
        lastDate,
        filters.type !== "" ? filters.type : undefined,
        filters.entity !== "" ? filters.entity : undefined,
        filters.action !== "" ? filters.action : undefined
    );

    const loadMore = useCallback(() => {
        // only load more if it's not already loading
        if (!isHistoryLoading) {
            // find the current last element
            const currentLastDate = _(history?.data).last().value()?.timestamp;

            setLastDate(currentLastDate);
        }
    }, [history?.data, isHistoryLoading]);

    // cache the history so we don't lose the data when loading the next page
    const [historyCache, setHistoryCache] = useState<History[]>([]);
    useEffect(() => {
        if (!isHistoryLoading && history?.data && history.data.length > 0) {
            setHistoryCache((cache) =>
                _([...cache, ...(history.data ?? [])])
                    .uniq((record) => JSON.stringify(record))
                    .value()
            );
        }
    }, [history?.data, isHistoryLoading]);

    const hasMore = useMemo(
        () => historyCache.length < (history?.records ?? 0),
        [history?.records, historyCache.length]
    );

    // when the filters change clear the cache and last dates
    useEffect(() => {
        setHistoryCache([]);
        setLastDate(filters.end);
    }, [filters]);

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
                <InfiniteScrollList hasMore={hasMore} loadMore={loadMore}>
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
