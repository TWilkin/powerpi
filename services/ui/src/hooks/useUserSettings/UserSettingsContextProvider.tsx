import i18next, { TFunction } from "i18next";
import { PropsWithChildren, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import UserSettingsContext, { UpdateSettingsAction, UserSettingsType } from "./UserSettingsContext";

const userSettingsStorageKey = "userSettings";

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
        if (settings.language !== i18n.language) {
            i18n.changeLanguage(settings.language);
        }
    }, [i18n, settings.language]);

    useEffect(() => {
        function handleLanguageChange() {
            dispatch({ type: "Reinitialise", defaults: buildInitialiser(t)() });
        }

        i18next.on("languageChanged", handleLanguageChange);

        return () => {
            i18next.off("languageChanged", handleLanguageChange);
        };
    }, [t]);

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

        case "Reinitialise":
            return update({ ...action.defaults });

        default:
            throw Error("Unknown action");
    }
}

function buildInitialiser(t: TFunction<"defaults">) {
    return function initialise(): UserSettingsType {
        const saved = localStorage.getItem(userSettingsStorageKey);
        const savedSettings: UserSettingsType | undefined = saved ? JSON.parse(saved) : undefined;

        const defaultSettings = {
            language: undefined,
            units: {
                current: t("units.current"),
                electricalPotential: t("units.electricalPotential"),
                gas: t("units.gas"),
                power: t("units.power"),
                temperature: t("units.temperature"),
            },
        };

        return {
            ...defaultSettings,
            ...savedSettings,
            units: {
                ...defaultSettings.units,
                ...savedSettings?.units,
            },
        };
    };
}
