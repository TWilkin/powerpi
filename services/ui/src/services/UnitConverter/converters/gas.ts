import { ConverterDefinition } from "../types";
import { energy } from "./energy";
import { volume } from "./volume";

const calorific = 38; // MJ/m3

const gas: ConverterDefinition[] = [
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

// add a conversion from kWh to m3, but only for the gas energy converter
const kWhIndex = energy.findIndex((energy) => energy.unit === "kWh");

if (kWhIndex !== -1) {
    const kWh = energy[kWhIndex];

    gas[kWhIndex] = {
        ...kWh,
        convert: {
            ...kWh.convert,
            m3: (value: number) => (value * 3.6) / (calorific * 1.02264),
        },
    };
}

export { gas };
