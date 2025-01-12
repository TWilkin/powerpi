import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { uniqueId } from "underscore";
import Select from "../../components/Select";

type HistoryPathFilter = {
    path: "types" | "entities" | "actions";

    value: string | undefined;

    onChange(value: string | undefined): void;
} & Pick<ReturnType<typeof useQuery<string[]>>, "data" | "isFetching">;

/** Component representing a drop-down of history path (type/entity/action) options. */
const HistoryPathFilter = ({ path, value, data, isFetching, onChange }: HistoryPathFilter) => {
    const { t } = useTranslation();

    const id = useMemo(() => uniqueId(`history-path-${path}`), [path]);

    const options = useMemo(
        () =>
            data?.map((record) => ({
                label: record,
                value: record,
            })) ?? [],
        [data],
    );

    return (
        <>
            <label htmlFor={id}>{t(`pages.history.filters.${path}`)}</label>

            <Select
                id={id}
                label={t(`pages.history.filters.${path}`)}
                options={options}
                value={value}
                loading={isFetching}
                onChange={onChange}
            />
        </>
    );
};
export default HistoryPathFilter;
