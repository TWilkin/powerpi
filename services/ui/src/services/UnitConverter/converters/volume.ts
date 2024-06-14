export const volume = [
    {
        unit: "m3", // metres cubed
        convert: {
            cf: (value: number) => value * 35.3147,
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
