import { useContext } from "react";
import { UserSettingsContext } from "./UserSettingsContext";
import { UserSettings } from "./types";

export default function useUserSettings(): UserSettings {
    return useContext(UserSettingsContext).settings;
}
