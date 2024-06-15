import { Dispatch } from "react";
import { UnitType } from "../../services/UnitConverter";

export type UserSettings = {
    units: {
        [key in UnitType]?: string;
    };
};

// reducer types
type UpdateUnit = { name: "UpdateUnit"; type: UnitType; unit: string };

export { UpdateUnit as UpdateUserSettingsAction };

// context type with the dispatch
export type UserSettingsContextType = {
    settings: UserSettings;
    dispatch?: Dispatch<UpdateUnit>;
};
