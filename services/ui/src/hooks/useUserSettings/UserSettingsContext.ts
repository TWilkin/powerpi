import { createContext, Dispatch } from "react";
import { UnitType } from "../../services/UnitConverter";

export type UserSettingsType = {
    /** The user's selected language. */
    language?: string;

    /** The user's selected unit conversions. */
    units: {
        [key in UnitType]?: string;
    };
};

type UpdateLanguageAction = { type: "Language"; language: string };
type UpdateUnitAction = { type: "Unit"; unitType: UnitType; unit: string };
type ReinitialiseAction = { type: "Reinitialise"; defaults: UserSettingsType };

export type UpdateSettingsAction = UpdateLanguageAction | UpdateUnitAction | ReinitialiseAction;

export type UserSettingsContextType = {
    /** The user's current settings. */
    settings?: UserSettingsType;

    /** The dispatch to update the user's settings. */
    dispatch?: Dispatch<UpdateSettingsAction>;
};

const UserSettingsContext = createContext<UserSettingsContextType>({});
export default UserSettingsContext;
