import { TFunction } from "i18next";
import { PropsWithChildren, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import UserSettingsContext, { UpdateSettingsAction, UserSettingsType } from "./UserSettingsContext";

type UserSettingsContextProviderProps = PropsWithChildren<unknown>;

const UserSettingsContextProvider = ({ children }: UserSettingsContextProviderProps) => {
    const { t, i18n } = useTranslation("defaults");

    const [settings, dispatch] = useReducer(reducer, {}, buildInitialiser(t));

    const context = useMemo(
        () => ({
            settings,
            dispatch,
        }),
        [settings],
    );

    // handle a language change
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

function buildInitialiser(t: TFunction<"defaults">) {
    return function initialise(): UserSettingsType {
        return {
            language: undefined,
            units: {
                temperature: t("units.temperature"),
                gas: t("units.gas"),
            },
        };
    };
}
