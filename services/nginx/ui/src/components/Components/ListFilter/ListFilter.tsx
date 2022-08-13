import { ChangeEvent, ReactNode } from "react";
import FilterGroup from "../FilterGroup";
import Loading from "../Loading";
import styles from "./ListFilter.module.scss";

interface ListFilterProps<TListType> {
    values?: TListType[];
    filters: TListType[];
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    element: (value: TListType) => ReactNode;
}

export default function ListFilter<TListType extends string>({
    values,
    filters,
    onChange,
    element,
}: ListFilterProps<TListType>) {
    return (
        <FilterGroup>
            <Loading loading={!values}>
                {values?.map((value) => (
                    <label key={value} className={styles.filter}>
                        <input
                            type="checkbox"
                            value={value}
                            checked={filters.includes(value)}
                            onChange={onChange}
                        />
                        {element(value)}
                    </label>
                ))}
            </Loading>
        </FilterGroup>
    );
}
