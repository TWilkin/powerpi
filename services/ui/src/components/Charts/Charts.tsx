import { faCog, faSliders } from "@fortawesome/free-solid-svg-icons";
import Chart from "../Components/Chart";
import FilterDrawer from "../Components/FilterDrawer";
import Message from "../Components/Message";
import UnitSettings from "../Components/UnitSettings";
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

            <FilterDrawer
                filters={[
                    {
                        id: "Filters",
                        icon: faSliders,
                        content: (
                            <ChartFilter
                                filters={filters}
                                onStartDateFilterChange={onStartDateFilterChange}
                                onEndDateFilterChange={onEndDateFilterChange}
                                onMessageTypeFilterChange={onMessageTypeFilterChange}
                                onClear={onClear}
                            />
                        ),
                    },
                    {
                        id: "Settings",
                        icon: faCog,
                        content: <UnitSettings />,
                    },
                ]}
            />
        </>
    );
};
export default Charts;
