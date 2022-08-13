import { History } from "@powerpi/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { chain as _ } from "underscore";
import { useGetHistory } from "../../hooks/history";
import AbbreviatingTime from "../Components/AbbreviatingTime";
import Filter from "../Components/Filter";
import List from "../Components/List";
import Message from "../Components/Message";
import { MessageTypeFilters } from "../Components/MessageTypeFilter";
import HistoryFilter from "./HistoryFilter";
import styles from "./HistoryList.module.scss";

const HistoryList = () => {
    const [lastDate, setLastDate] = useState<Date | undefined>();

    const [filters, setFilters] = useState<MessageTypeFilters>({
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    const records = 5;

    const { isHistoryLoading, isHistoryError, history } = useGetHistory(
        records,
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
            setHistoryCache((cache) => [...cache, ...(history.data ?? [])]);
        }
    }, [history?.data, isHistoryLoading]);

    const hasMore = useMemo(
        () => historyCache.length < (history?.records ?? 0),
        [history?.records, historyCache.length]
    );

    return (
        <>
            <Filter>
                <HistoryFilter updateFilter={setFilters} />
            </Filter>

            <div className={styles.list}>
                <List ref={scrollRef}>
                    <InfiniteScroll
                        hasMore={hasMore}
                        loadMore={loadMore}
                        getScrollParent={() => scrollRef.current}
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
                    </InfiniteScroll>
                </List>
            </div>
        </>
    );
};
export default HistoryList;
