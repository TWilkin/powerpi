import { useContext } from "react";
import { UserSettingsContext } from "./UserSettingsContext";

export default function useUserSettings() {
    return useContext(UserSettingsContext).dispatch;
}
