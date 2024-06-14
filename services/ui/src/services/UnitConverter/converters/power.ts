export const power = [
    {
        unit: "Wh",
        convert: {
            kWh: (value: number) => value * 1000,
        },
    },
    {
        unit: "kWh",
        convert: {
            Wh: (value: number) => value / 1000,
        },
    },
];
