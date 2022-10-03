import classNames from "classnames";
import { ChangeEvent, ReactNode, useMemo } from "react";
import FilterGroup from "../FilterGroup";
import Loading from "../Loading";
import styles from "./ListFilter.module.scss";

export interface IListFilter {
    key: string;
    value: string;
}

interface ListFilterProps<TListType extends IListFilter> {
    title: string;
    values?: TListType[];
    filters: string[];
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    element: (value: TListType) => ReactNode;
}

export default function ListFilter<TListType extends IListFilter>({
    title,
    values,
    filters,
    onChange,
    element,
}: ListFilterProps<TListType>) {
    const allChecked = useMemo(() => (values ?? []).length === filters.length, [filters, values]);

    return (
        <FilterGroup>
            <h4 className={styles.title}>{title}:</h4>

            <Loading loading={!values}>
                <label className={classNames(styles.filter, styles.meta)}>
                    <input
                        type="checkbox"
                        value={undefined}
                        checked={allChecked}
                        onChange={onChange}
                    />
                    All
                </label>

                {values?.map((value) => (
                    <label
                        key={value.key}
                        className={classNames(styles.filter, {
                            [styles.meta]: value.key === "unspecified",
                        })}
                    >
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
