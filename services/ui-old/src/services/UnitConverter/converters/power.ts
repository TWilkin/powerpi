export const power = [
    {
        unit: "Wh",
        name: "Watt Hours",
        convert: {
            kWh: (value: number) => value * 1000,
        },
    },
    {
        unit: "kWh",
        name: "Kilowatt Hours",
        convert: {
            Wh: (value: number) => value / 1000,
        },
    },
];
