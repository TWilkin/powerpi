import { ReactNode } from "react";
import styles from "./List.module.scss";

const List = ({ children }: { children: ReactNode }) => {
    return <div className={styles.list}>{children}</div>;
};
export default List;
