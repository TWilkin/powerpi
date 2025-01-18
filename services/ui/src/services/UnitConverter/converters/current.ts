import { ConverterDefinition } from "../types";

export const current: ConverterDefinition[] = [
    {
        unit: "mA",
        key: "milliampere",
        convert: {
            A: (value: number) => value / 1000,
        },
    },
    {
        unit: "A",
        key: "ampere",
        convert: {
            mA: (value: number) => value * 1000,
        },
    },
];
