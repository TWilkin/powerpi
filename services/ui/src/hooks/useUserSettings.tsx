import { UnitType } from "../services/UnitConverter";

type UserSettings = {
    units: {
        [key in UnitType]?: string;
    };
};

export default function useUserSettings(): UserSettings {
    return {
        units: {
            temperature: "F",
            gas: "kWh",
        },
    };
}
