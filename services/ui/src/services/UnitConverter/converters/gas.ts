import { ConverterDefinition } from "../types";
import { energy } from "./energy";
import { volume } from "./volume";

const calorific = 38; // MJ/m3

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
    ...energy,
];
