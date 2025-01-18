import { ConverterDefinition } from "../types";

export const power: ConverterDefinition[] = [
    {
        unit: "W",
        key: "watt",
        convert: {
            kW: (value: number) => value / 1000,
        },
    },
    {
        unit: "kW",
        key: "kilowatt",
        convert: {
            W: (value: number) => value * 1000,
        },
    },
];
