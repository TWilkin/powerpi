import { PowerPiApi } from "@powerpi/api";
import { useState } from "react";
import Chart from "../Components/Chart";
import Filter from "../Components/Filter";
import ChartFilter, { ChartFilters } from "./ChartFilter";

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

            <div id="charts">
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
