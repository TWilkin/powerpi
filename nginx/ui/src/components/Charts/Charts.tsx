import { useState } from "react";
import Chart from "../Components/Chart";
import Filter from "../Components/Filter";
import ChartFilter, { ChartFilters } from "./ChartFilter";
import styles from "./Charts.module.scss";

const Charts = () => {
    const [filters, setFilters] = useState<ChartFilters>({
        start: undefined,
        end: undefined,
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    return (
        <>
            <Filter>
                <ChartFilter updateFilter={setFilters} />
            </Filter>

            <div className={styles.charts}>
                {(filters.entity || filters.action) && (
                    <Chart
                        start={filters.start}
                        end={filters.end}
                        entity={filters.entity}
                        action={filters.action}
                    />
                )}
            </div>
        </>
    );
};
export default Charts;
