import { UnitType } from "../../services/UnitConverter";

export type UserSettings = {
    units: {
        [key in UnitType]?: string;
    };
};
