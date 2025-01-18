import { useTranslation } from "react-i18next";
import FieldSet from "../../../components/FieldSet";
import useUserSettings from "../../../hooks/useUserSettings";
import UnitOption from "./UnitOption";

/** Component to display the settings for unit selection. */
const UnitSettings = () => {
    const { t } = useTranslation();

    const { settings, dispatch } = useUserSettings();

    return (
        <FieldSet legend={t("pages.settings.units")}>
            <UnitOption type="current" value={settings?.units.current} dispatch={dispatch} />

            <UnitOption
                type="electricalPotential"
                value={settings?.units.electricalPotential}
                dispatch={dispatch}
            />

            <UnitOption type="gas" value={settings?.units.gas} dispatch={dispatch} />

            <UnitOption
                type="temperature"
                value={settings?.units.temperature}
                dispatch={dispatch}
            />
        </FieldSet>
    );
};
export default UnitSettings;
