import { power } from "./power";
import { volume } from "./volume";

const calorific = 38; // MJ/m3

export const gas = [
    {
        unit: "m3",
        name: "Metres Cubed",
        convert: {
            kWh: (value: number) => (value * calorific * 1.02264) / 3.6,
        },
    },
    // we need the volume converters too
    ...volume,
    // and the power converters
    ...power,
];
