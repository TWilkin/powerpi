import { PropsWithChildren, useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import List from "../List";
import Loading from "../Loading";
import styles from "./InfiniteScrollList.module.scss";

type InfiniteScrollListProps = PropsWithChildren<{
    hasMore: boolean;
    loadMore: () => void;
}>;

const InfiniteScrollList = ({ hasMore, loadMore, children }: InfiniteScrollListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <List ref={scrollRef}>
            <InfiniteScroll
                hasMore={hasMore}
                loadMore={loadMore}
                getScrollParent={() => scrollRef.current}
                loader={<Loading key="loading" className={styles.loading} loading />}
            >
                <>{children}</>
            </InfiniteScroll>
        </List>
    );
};
export default InfiniteScrollList;
