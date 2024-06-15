import { PropsWithChildren, createContext, useEffect, useMemo, useReducer } from "react";
import { isEqual } from "underscore";
import { defaultSettings } from "./defaults";
import { UpdateUserSettingsAction, UserSettings, UserSettingsContextType } from "./types";

const userSettingsStorageKey = "userSettings";

export const UserSettingsContext = createContext<UserSettingsContextType>({
    settings: defaultSettings,
});

type UserSettingsContextProviderProps = PropsWithChildren<unknown>;

export const UserSettingsContextProvider = ({ children }: UserSettingsContextProviderProps) => {
    const [settings, settingsDispatch] = useReducer(reducer, defaultSettings, initialiser);

    const context = useMemo(() => ({ settings, dispatch: settingsDispatch }), [settings]);

    // save the settings when it's changed
    useEffect(() => {
        if (isEqual(settings, defaultSettings)) {
            localStorage.setItem(userSettingsStorageKey, JSON.stringify(settings));
        } else {
            localStorage.removeItem(userSettingsStorageKey);
        }
    }, [settings]);

    return <UserSettingsContext.Provider value={context}>{children}</UserSettingsContext.Provider>;
};

function reducer(state: UserSettings, action: UpdateUserSettingsAction) {
    if (action.name === "UpdateUnit") {
        return {
            ...state,
            units: {
                ...state.units,
                [action.type]: action.unit,
            },
        };
    }

    throw new Error("Unknown action");
}

function initialiser() {
    const saved = localStorage.getItem(userSettingsStorageKey);
    let json: UserSettings = saved ? JSON.parse(saved) : undefined;

    if (json && Object.keys(json).length > 0) {
        // ensure it has any of the defaults
        json = {
            ...defaultSettings,
            ...json,
            units: {
                ...defaultSettings.units,
                ...json.units,
            },
        };

        return json;
    }

    return defaultSettings;
}
