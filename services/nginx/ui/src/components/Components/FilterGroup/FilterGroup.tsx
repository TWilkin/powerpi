import { PropsWithChildren } from "react";
import styles from "./FilterGroup.module.scss";

type FilterGroupProps = PropsWithChildren<unknown>;

const FilterGroup = ({ children }: FilterGroupProps) => (
    <>
        <div>{children}</div>
        <hr className={styles.rule} />
    </>
);
export default FilterGroup;
