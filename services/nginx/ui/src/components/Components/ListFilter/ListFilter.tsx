import { ChangeEvent, ReactNode } from "react";
import FilterGroup from "../FilterGroup";
import Loading from "../Loading";
import styles from "./ListFilter.module.scss";

export interface IListFilter {
    key: string;
    value: string;
}

interface ListFilterProps<TListType extends IListFilter> {
    values?: TListType[];
    filters: string[];
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    element: (value: TListType) => ReactNode;
}

export default function ListFilter<TListType extends IListFilter>({
    values,
    filters,
    onChange,
    element,
}: ListFilterProps<TListType>) {
    return (
        <FilterGroup>
            <Loading loading={!values}>
                {values?.map((value) => (
                    <label key={value.key} className={styles.filter}>
                        <input
                            type="checkbox"
                            value={value.key}
                            checked={filters.includes(value.key)}
                            onChange={onChange}
                        />
                        {element(value)}
                    </label>
                ))}
            </Loading>
        </FilterGroup>
    );
}
