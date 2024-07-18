export const volume = [
    {
        unit: "m3",
        name: "Metres Cubed",
        convert: {
            cf: (value: number) => value * 35.3147,
        },
    },
    {
        unit: "cf",
        name: "Cubic Feet",
        convert: {
            hcf: (value: number) => value * 0.01,
        },
    },
    {
        unit: "hcf",
        name: "Hundred Cubic Feet",
        convert: {
            m3: (value: number) => value * 2.8316846592,
            cf: (value: number) => value / 100,
        },
    },
];
