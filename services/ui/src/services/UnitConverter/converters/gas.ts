import { ConverterDefinition } from "../types";
import { energy } from "./energy";
import { volume } from "./volume";

const calorific = 38; // MJ/m3

const modifiedEnergy = energy.map((converter) => {
    // Add a conversion from kWh to m3, but only for the gas energy converter
    if (converter.unit === "kWh") {
        return {
            ...converter,
            convert: {
                ...converter.convert,
                m3: (value: number) => (value * 3.6) / (calorific * 1.02264),
            },
        };
    }

    return converter;
});

export const gas: ConverterDefinition[] = [
    {
        unit: "m3",
        key: "metres cubed",
        convert: {
            kWh: (value: number) => (value * calorific * 1.02264) / 3.6,
        },
    },
    // we need the volume converters too
    ...volume,
    // and the energy converters
    ...modifiedEnergy,
];
