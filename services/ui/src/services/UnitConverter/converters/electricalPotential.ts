import { ConverterDefinition } from "../types";

export const electricalPotential: ConverterDefinition[] = [
    {
        unit: "mV",
        key: "millivolt",
        convert: {
            V: (value: number) => value / 1000,
        },
    },
    {
        unit: "V",
        key: "volt",
        convert: {
            mV: (value: number) => value * 1000,
        },
    },
];
