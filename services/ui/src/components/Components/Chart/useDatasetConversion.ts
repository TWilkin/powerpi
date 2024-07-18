import { useMemo } from "react";
import useUserSettings, { UserSettings } from "../../../hooks/UserSettings";
import UnitConverter, { UnitType } from "../../../services/UnitConverter";
import { Dataset } from "./useHistoryDatasets";

export default function useDatasetConversion(datasets?: Dataset[]) {
    const settings = useUserSettings();

    return useMemo(
        () =>
            datasets?.map((dataset) => {
                // first generate a converter for this dataset
                const { unit, converter } = generateConverter(settings, dataset);

                // now we can convert the data
                const converted = dataset.data.map((data) => ({
                    ...data,
                    value: converter(data.value),
                }));

                return {
                    ...dataset,
                    unit,
                    data: converted,
                };
            }),
        [datasets, settings],
    );
}

function generateConverter(settings: UserSettings, dataset: Dataset) {
    if (dataset.action && dataset.unit) {
        const unitTypes = [dataset.action, dataset.entity] as UnitType[];

        for (const unitType of unitTypes) {
            const userSelectedUnit = settings.units[unitType];

            if (userSelectedUnit && userSelectedUnit !== dataset.unit) {
                const converter = UnitConverter.generateConversion(
                    unitType,
                    dataset.unit,
                    userSelectedUnit,
                );

                if (converter) {
                    return {
                        unit: userSelectedUnit,
                        converter,
                    };
                }
            }
        }
    }

    return {
        unit: dataset.unit,
        converter: (value: number) => value,
    };
}
