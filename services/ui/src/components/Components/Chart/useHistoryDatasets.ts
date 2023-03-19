import { useMemo } from "react";
import { chain as _ } from "underscore";
import { useGetHistoryRange } from "../../../hooks/history";

export interface DataPoint {
    value: number;
    timestamp: Date;
}

export interface Dataset {
    entity: string;
    action: string;
    unit: string | undefined;
    data: DataPoint[];
}

export default function useHistoryDatasets(
    start?: Date,
    end?: Date,
    entity?: string,
    action?: string
) {
    const { isHistoryLoading, history } = useGetHistoryRange(start, end, "event", entity, action);

    const datasets = useMemo(
        () =>
            history?.reduce<Dataset[]>((datasets, record) => {
                // check this data point actually has data that we're looking for
                if (record.message && "value" in record.message && "unit" in record.message) {
                    const message = record.message as { unit: string; value: number };

                    // find the dataset
                    let dataset = datasets.find(
                        (dataset) =>
                            dataset.entity.toLowerCase() === record.entity.toLowerCase() &&
                            dataset.action.toLowerCase() === record.action.toLowerCase() &&
                            dataset.unit == message.unit
                    );

                    if (!dataset) {
                        // create the dataset
                        dataset = {
                            entity: record.entity,
                            action: record.action,
                            unit: message.unit,
                            data: [],
                        };

                        datasets.push(dataset);
                    }

                    // add the record
                    if (record.message && record.timestamp) {
                        dataset.data.push({
                            value: message.value,
                            timestamp: record.timestamp,
                        });
                    }
                }

                return _(datasets)
                    .sortBy((dataset) => dataset.entity)
                    .sortBy((dataset) => dataset.action)
                    .value();
            }, []),
        [history]
    );

    return {
        datasets,
        isHistoryLoading,
    };
}
