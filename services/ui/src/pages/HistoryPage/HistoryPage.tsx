import { History } from "@powerpi/common-api";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef } from "react";
import _ from "underscore";
import Table from "../../components/Table";
import useInfiniteQueryHistory from "../../queries/useInfiniteQueryHistory";
import HistoryRow from "./HistoryRow";
import LoaderRow from "./LoaderRow";

const HistoryPage = () => {
    const parentRef = useRef<HTMLDivElement>(null);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQueryHistory();

    const rows = useMemo(
        () => _(data.pages.flatMap((page) => page.data)).unique(generateKey),
        [data?.pages],
    );

    const virtualiser = useVirtualizer({
        count: hasNextPage ? rows.length + 1 : rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 2 * 16, // 2rem
        overscan: 5,
    });
    const items = virtualiser.getVirtualItems();

    // fetch more data
    useEffect(() => {
        const [lastItem] = [...items].reverse();

        if (!lastItem) {
            return;
        }

        if (lastItem.index >= rows.length - 1 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, items, rows.length]);

    return (
        <div className="h-[90vh] overflow-auto" ref={parentRef}>
            <Table grow={false} style={{ height: `${virtualiser.getTotalSize()}px` }}>
                <tbody>
                    {items.map((virtualRow) => {
                        const isLoaderRow = virtualRow.index > rows.length - 1;
                        if (isLoaderRow) {
                            return <LoaderRow key="loader" />;
                        }

                        const row = rows[virtualRow.index];
                        if (!row) {
                            return <></>;
                        }

                        return <HistoryRow key={generateKey(row)} row={row} />;
                    })}
                </tbody>
            </Table>
        </div>
    );
};
export default HistoryPage;

function generateKey(row: History | undefined) {
    if (!row) {
        return undefined;
    }

    return `${row.type}/${row.entity}/${row.action}:${row.timestamp}`;
}
