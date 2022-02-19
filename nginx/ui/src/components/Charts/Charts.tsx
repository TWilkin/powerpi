import { PowerPiApi } from "@powerpi/api";
import { useState } from "react";
import { Chart, Filter } from "../Components";
import ChartFilter, { ChartFilters } from "./ChartFilter";
import styles from "./Charts.module.scss";

interface ChartsProps {
    api: PowerPiApi;
}

const Charts = ({ api }: ChartsProps) => {
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
                <ChartFilter api={api} updateFilter={setFilters} />
            </Filter>

            <div className={styles.charts}>
                {(filters.entity || filters.action) && (
                    <Chart
                        api={api}
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
