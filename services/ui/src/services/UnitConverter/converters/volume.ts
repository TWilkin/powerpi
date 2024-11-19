import { ConverterDefinition } from "../types";

export const volume: ConverterDefinition[] = [
    {
        unit: "m3",
        key: "metres cubed",
        convert: {
            cf: (value: number) => value * 35.3147,
        },
    },
    {
        unit: "cf",
        key: "cubic feet",
        convert: {
            hcf: (value: number) => value / 100,
        },
    },
    {
        unit: "hcf",
        key: "hundred cubic feet",
        convert: {
            m3: (value: number) => value * 2.8316846592,
        },
    },
];
