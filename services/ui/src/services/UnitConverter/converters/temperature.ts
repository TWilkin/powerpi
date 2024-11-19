import { ConverterDefinition } from "../types";

export const temperature: ConverterDefinition[] = [
    {
        unit: "°C",
        key: "celsius",
        convert: {
            F: (value: number) => value * (9 / 5) + 32,
            K: (value: number) => value + 273.15,
        },
    },
    {
        unit: "K",
        key: "kelvin",
        convert: {
            "°C": (value: number) => value - 273.15,
        },
    },
    {
        unit: "F",
        key: "fahrenheit",
        convert: {
            "°C": (value: number) => (value - 32) * (5 / 9),
        },
    },
];
