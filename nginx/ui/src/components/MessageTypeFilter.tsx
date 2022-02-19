import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent } from "react";
import Loading from "./Components/Loading";

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
    defaultSelected?: string;
    onSelect: (type: MessageFilterType, value: string) => void;
    loading: boolean;
    error: boolean;
}

const MessageTypeFilter = ({
    name,
    type,
    options,
    defaultSelected,
    onSelect,
    loading,
    error,
}: MesageTypeFilterProps) => {
    const handleFilterChange = (event: FormEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value ?? "";
        onSelect(type, value);
    };

    return (
        <div>
            <label htmlFor={`${type}-filter`}>{name}: </label>

            <Loading loading={loading}>
                {error ? (
                    <FontAwesomeIcon icon={faExclamation} />
                ) : (
                    <select
                        name={`${type}-filter`}
                        onChange={handleFilterChange}
                        defaultValue={defaultSelected}
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
