import { forwardRef, PropsWithChildren } from "react";
import styles from "./List.module.scss";

type ListProps = PropsWithChildren<unknown>;

const List = forwardRef<HTMLDivElement, ListProps>(({ children }: ListProps, ref) => (
    <div className={styles.list} ref={ref}>
        {children}
    </div>
));
List.displayName = "List";

export default List;
