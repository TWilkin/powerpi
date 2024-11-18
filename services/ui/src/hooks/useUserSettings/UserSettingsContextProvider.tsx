import { PropsWithChildren, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import UserSettingsContext, { UpdateSettingsAction, UserSettingsType } from "./UserSettingsContext";

type UserSettingsContextProviderProps = PropsWithChildren<unknown>;

const UserSettingsContextProvider = ({ children }: UserSettingsContextProviderProps) => {
    const [settings, dispatch] = useReducer(reducer, {}, initialiser);

    const context = useMemo(
        () => ({
            settings,
            dispatch,
        }),
        [settings],
    );

    // handle a language change
    const { i18n } = useTranslation();
    useEffect(() => {
        if (settings.language) {
            i18n.changeLanguage(settings.language);
        }
    }, [i18n, settings.language]);

    return <UserSettingsContext.Provider value={context}>{children}</UserSettingsContext.Provider>;
};
export default UserSettingsContextProvider;

function reducer(state: UserSettingsType, action: UpdateSettingsAction) {
    const update = (newState: Partial<UserSettingsType>) => ({ ...state, ...newState });

    switch (action.type) {
        case "Language":
            return update({ language: action.language });

        case "Unit":
            return update({ units: { ...state.units, [action.unitType]: action.unit } });

        default:
            throw Error("Unknown action");
    }
}

function initialiser(): UserSettingsType {
    return {
        language: undefined,
        units: {},
    };
}
