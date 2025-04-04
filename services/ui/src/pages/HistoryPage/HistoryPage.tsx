import { History } from "@powerpi/common-api";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import Button from "../../components/Button";
import Message from "../../components/Message";
import Scrollbar from "../../components/Scrollbar";
import { useSlideAnimation } from "../../components/SlideAnimation";
import Table from "../../components/Table";
import TableRow from "../../components/TableRow";
import useInfiniteQueryHistory from "../../queries/useInfiniteQueryHistory";
import HistoryFilter from "./HistoryFilter";
import HistoryRow from "./HistoryRow";
import LoaderRow from "./LoaderRow";
import useHistoryFilter from "./useHistoryFilter";

const HistoryPage = () => {
    const { t } = useTranslation();

    const scrollRef = useRef<HTMLDivElement>(null);

    const { state, dispatch, clear } = useHistoryFilter();
    const { open: filterOpen, handleToggle: handleFilterToggle } = useSlideAnimation();

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQueryHistory(
        state.start,
        state.type,
        state.entity,
        state.action,
    );

    const rows = useMemo(
        () => _(data.pages.flatMap((page) => page.data)).unique(generateKey),
        [data?.pages],
    );

    const total = useMemo(() => _(data.pages).last()?.records ?? 0, [data.pages]);

    const virtualiser = useVirtualizer({
        count: hasNextPage ? rows.length + 1 : rows.length,
        getScrollElement: () => scrollRef.current,
        getItemKey: (index) => generateKey(rows[index]) ?? index,
        estimateSize: () => 2 * 16, // 2rem
        overscan: 10,
    });
    const items = virtualiser.getVirtualItems();

    // calculate how much padding is required before and after the rows we're actually showing
    const [before, after] = useMemo(() => {
        if (items.length > 0) {
            return [
                items[0].start - virtualiser.options.scrollMargin,
                virtualiser.getTotalSize() - (_(items).last()?.end ?? 0),
            ];
        }

        return [0, 0];
    }, [items, virtualiser]);

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
        <>
            <div className="w-full flex gap-1 items-center">
                <Button
                    icon="filter"
                    aria-label={t(filterOpen ? "common.close filter" : "common.open filter")}
                    onClick={handleFilterToggle}
                />
            </div>

            <HistoryFilter open={filterOpen} state={state} dispatch={dispatch} clear={clear} />

            {total === 0 && <Message translation="pages.history" type="empty" />}
            {total !== 0 && rows.length === 0 && (
                <Message translation="pages.history" type="filtered" count={total} />
            )}

            {rows.length !== 0 && (
                <Scrollbar ref={scrollRef}>
                    <div style={{ height: `${virtualiser.getTotalSize()}px` }}>
                        <Table>
                            <thead>
                                <TableRow header>
                                    <th>{t("pages.history.headings.type")}</th>
                                    <th>{t("pages.history.headings.entity")}</th>
                                    <th>{t("pages.history.headings.action")}</th>
                                    <th>{t("pages.history.headings.when")}</th>
                                    <th>{t("pages.history.headings.message")}</th>
                                </TableRow>
                            </thead>

                            <tbody>
                                {before > 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ height: before }} />
                                    </tr>
                                )}

                                {items.map((virtualRow) => {
                                    const isLoaderRow = virtualRow.index > rows.length - 1;
                                    if (isLoaderRow) {
                                        return <LoaderRow key="loader" index={rows.length} />;
                                    }

                                    const row = rows[virtualRow.index];
                                    if (!row) {
                                        return <></>;
                                    }

                                    return (
                                        <HistoryRow
                                            key={virtualRow.key}
                                            row={row}
                                            index={virtualRow.index}
                                            height={virtualRow.size}
                                        />
                                    );
                                })}

                                {after > 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ height: after }} />
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Scrollbar>
            )}
        </>
    );
};
export default HistoryPage;

function generateKey(row: History | undefined) {
    if (!row) {
        return undefined;
    }

    return `${row.type}/${row.entity}/${row.action}:${row.timestamp}`;
}
