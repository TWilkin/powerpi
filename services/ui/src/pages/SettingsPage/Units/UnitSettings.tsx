import classNames from "classnames";
import { useTranslation } from "react-i18next";
import useUserSettings from "../../../hooks/useUserSettings";
import UnitOption from "./UnitOption";

/** Component to display the settings for unit selection. */
const UnitSettings = () => {
    const { t } = useTranslation();

    const { settings, dispatch } = useUserSettings();

    return (
        <fieldset
            className={classNames(
                "p-2 grid auto-rows-auto grid-cols-2 gap-2 items-center",
                "border-2 border-black dark:border-white",
            )}
        >
            <legend className="col-span-2 text-lg">{t("pages.settings.units")}</legend>

            <UnitOption type="gas" value={settings?.units.gas} dispatch={dispatch} />
            <UnitOption
                type="temperature"
                value={settings?.units.temperature}
                dispatch={dispatch}
            />
        </fieldset>
    );
};
export default UnitSettings;
