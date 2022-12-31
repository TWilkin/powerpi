import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Tooltip,
} from "chart.js";
import "chartjs-adapter-luxon";
import { Line } from "react-chartjs-2";
import Loading from "../Loading";
import styles from "./Chart.module.scss";
import useChart from "./useChart";
import useHistoryDatasets from "./useHistoryDatasets";

ChartJS.register(
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Tooltip
);

interface ChartProps {
    start?: Date;
    end?: Date;
    entity?: string;
    action?: string;
}

const Chart = ({ start, end, entity, action }: ChartProps) => {
    const { datasets, isHistoryLoading } = useHistoryDatasets(start, end, entity, action);

    const chart = useChart(datasets);

    return (
        <div className={styles.chart}>
            <Loading loading={isHistoryLoading}>
                <Line {...chart} />
            </Loading>
        </div>
    );
};
export default Chart;
