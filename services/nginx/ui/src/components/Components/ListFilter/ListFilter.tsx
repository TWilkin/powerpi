import { ChangeEvent, ReactNode, useMemo } from "react";
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
    const allChecked = useMemo(() => (values ?? []).length === filters.length, [filters, values]);

    return (
        <FilterGroup>
            <Loading loading={!values}>
                <label className={styles.filter}>
                    <input
                        type="checkbox"
                        value={undefined}
                        checked={allChecked}
                        onChange={onChange}
                    />
                    <em>All</em>
                </label>

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
