import { ChangeEvent } from "react";
import DeviceIcon from "../Components/DeviceIcon";
import Loading from "../Components/Loading";
import styles from "./DeviceFilter.module.scss";
import { Filters } from "./useDeviceFilter";

interface DeviceFilterProps {
    filters: Filters;
    types: string[];
    onTypeChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DeviceFilter = ({ filters, types, onTypeChange }: DeviceFilterProps) => {
    return (
        <div className={styles.filters}>
            <Loading loading={!types}>
                {types?.map((type) => (
                    <label key={type}>
                        <input
                            type="checkbox"
                            name="device-type"
                            value={type}
                            checked={filters.types.includes(type)}
                            onChange={onTypeChange}
                        />
                        <DeviceIcon type={type} />
                        <div>{type}</div>
                    </label>
                ))}
            </Loading>
        </div>
    );
};
export default DeviceFilter;
