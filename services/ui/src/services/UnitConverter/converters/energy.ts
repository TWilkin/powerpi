import { ConverterDefinition } from "../types";

export const energy: ConverterDefinition[] = [
    {
        unit: "Wh",
        key: "watt hours",
        convert: {
            kWh: (value: number) => value / 1000,
            J: (value: number) => value / 3600,
        },
    },
    {
        unit: "kWh",
        key: "kilowatt hours",
        convert: {
            Wh: (value: number) => value * 1000,
        },
    },
    {
        unit: "J",
        key: "joule",
        convert: {
            Wh: (value: number) => value * 3600,
            kJ: (value: number) => value / 1000,
        },
    },
    {
        unit: "kJ",
        key: "kilojoule",
        convert: {
            J: (value: number) => value * 1000,
        },
    },
];
