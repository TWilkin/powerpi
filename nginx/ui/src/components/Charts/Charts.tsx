import { useState } from "react";
import Chart from "../Components/Chart";
import Filter from "../Components/Filter";
import Message from "../Components/Message";
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
                {filters.entity || filters.action ? (
                    <Chart
                        start={filters.start}
                        end={filters.end}
                        entity={filters.entity}
                        action={filters.action}
                    />
                ) : (
                    <Message message="Use the filters on the left to choose the chart data you want to see." />
                )}
            </div>
        </>
    );
};
export default Charts;
