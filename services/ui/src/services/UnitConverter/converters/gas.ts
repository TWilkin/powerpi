const calorific = 38; // MJ/m3

export const gas = [
    {
        unit: "m3", // metres cubed
        convert: {
            kWh: (value: number) => (value * calorific * 1.02264) / 3.6,
        },
    },
    {
        unit: "cf", // cubic feet
        convert: {
            hcf: (value: number) => value * 0.01,
        },
    },
    {
        unit: "hcf", // hundred-cubic feet
        convert: {
            m3: (value: number) => value * 2.8316846592,
            cf: (value: number) => value / 100,
        },
    },
];
