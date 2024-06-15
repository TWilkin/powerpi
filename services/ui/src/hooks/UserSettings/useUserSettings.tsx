import { useMemo } from "react";
import { UserSettings } from "./types";

export const defaultSettings: UserSettings = {
    units: {
        gas: "m3",
        temperature: "°C",
    },
};

export default function useUserSettings(): UserSettings {
    // the storage key is the string we use in local storage to remember the settings
    const storageKey = "UserSettings";

    // load from local storage
    const settings = useMemo(() => {
        // retrieve the settings from storage
        const saved = localStorage.getItem(storageKey);
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

        // there was no saved settings so use the default
        return defaultSettings;
    }, []);

    return settings;
}
