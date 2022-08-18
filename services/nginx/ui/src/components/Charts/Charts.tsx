import Chart from "../Components/Chart";
import Filter from "../Components/Filter";
import Message from "../Components/Message";
import ChartFilter from "./ChartFilter";
import styles from "./Charts.module.scss";
import useChartFilter from "./useChartFilter";

const Charts = () => {
    const {
        filters,
        onClear,
        onStartDateFilterChange,
        onEndDateFilterChange,
        onMessageTypeFilterChange,
    } = useChartFilter();

    return (
        <>
            <Filter onClear={onClear}>
                <ChartFilter
                    filters={filters}
                    onStartDateFilterChange={onStartDateFilterChange}
                    onEndDateFilterChange={onEndDateFilterChange}
                    onMessageTypeFilterChange={onMessageTypeFilterChange}
                />
            </Filter>

            <div className={styles.charts}>
                {filters.entity || filters.action ? (
                    <Chart
                        start={filters.start ?? undefined}
                        end={filters.end ?? undefined}
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
