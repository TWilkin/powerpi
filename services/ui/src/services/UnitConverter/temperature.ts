const converter = [
    {
        unit: "°C",
        convert: {
            F: (value: number) => value * (9 / 5) + 32,
            K: (value: number) => value + 273.15,
        },
    },
    {
        unit: "K",
        convert: {
            "°C": (value: number) => value - 273.15,
        },
    },
    {
        unit: "F",
        convert: {
            "°C": (value: number) => (value - 32) * (5 / 9),
        },
    },
];
export default converter;
