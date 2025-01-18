import { ConverterDefinition } from "../types";

export const power: ConverterDefinition[] = [
    {
        unit: "Wh",
        key: "watt hours",
        convert: {
            kWh: (value: number) => value * 1000,
        },
    },
    {
        unit: "kWh",
        key: "kilowatt hours",
        convert: {
            Wh: (value: number) => value / 1000,
        },
    },
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
