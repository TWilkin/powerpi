import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent } from "react";
import Loading from "../Loading";
import styles from "./MessageTypeFilter.module.scss";

export type MessageFilterType = "type" | "entity" | "action";

export interface MessageTypeFilters {
    type: string | undefined;
    entity: string | undefined;
    action: string | undefined;
}

interface MesageTypeFilterProps {
    name: string;
    type: MessageFilterType;
    options?: string[];
    selected?: string;
    onSelect: (type: MessageFilterType, value: string) => void;
    loading: boolean;
    error: boolean;
}

const MessageTypeFilter = ({
    name,
    type,
    options,
    selected,
    onSelect,
    loading,
    error,
}: MesageTypeFilterProps) => {
    const handleFilterChange = (event: FormEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value ?? "";
        onSelect(type, value);
    };

    return (
        <div className={styles.filter}>
            <label htmlFor={`${type}-filter`}>{name}: </label>

            <Loading className={styles.loading} loading={loading}>
                {error ? (
                    <FontAwesomeIcon icon={faExclamation} />
                ) : (
                    <select
                        name={`${type}-filter`}
                        onChange={handleFilterChange}
                        value={selected ?? ""}
                    >
                        <option value="">-</option>

                        {options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )}
            </Loading>
        </div>
    );
};
export default MessageTypeFilter;
