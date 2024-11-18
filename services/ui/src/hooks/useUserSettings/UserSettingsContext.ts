import { createContext, Dispatch } from "react";

export type UserSettingsType = {
    language?: string;
};

type UpdateLanguageAction = { type: "Language"; language: string };
type UpdateUnitAction = { type: "Unit"; unit: string };

export type UpdateSettingsAction = UpdateLanguageAction | UpdateUnitAction;

export type UserSettingsContextType = {
    settings?: UserSettingsType;

    dispatch?: Dispatch<UpdateSettingsAction>;
};

const UserSettingsContext = createContext<UserSettingsContextType>({});
export default UserSettingsContext;
