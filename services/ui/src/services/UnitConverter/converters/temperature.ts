export const temperature = [
    {
        unit: "°C",
        name: "Celsius",
        convert: {
            F: (value: number) => value * (9 / 5) + 32,
            K: (value: number) => value + 273.15,
        },
    },
    {
        unit: "K",
        name: "Kelvin",
        convert: {
            "°C": (value: number) => value - 273.15,
        },
    },
    {
        unit: "F",
        name: "Fahrenheit",
        convert: {
            "°C": (value: number) => (value - 32) * (5 / 9),
        },
    },
];
