import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chain as _ } from "underscore";
import FieldSet from "../../../components/FieldSet";
import Select from "../../../components/Select";
import useUserSettings from "../../../hooks/useUserSettings";
import { supportedLanguages } from "../../../localisation";

/** Component to display the language selection. */
const LanguageSettings = () => {
    const { i18n, t } = useTranslation();

    const { settings, dispatch } = useUserSettings();

    const options = useMemo(
        () =>
            _(supportedLanguages)
                .map((language) => ({
                    label: language.label,
                    value: language.id,
                }))
                .sortBy((option) => option.label)
                .value(),
        [],
    );

    const handleChange = useCallback(
        (value: string) => {
            if (dispatch) {
                dispatch({ type: "Language", language: value });
            }
        },
        [dispatch],
    );

    const currentLanguage = i18n.language ?? settings?.language ?? "en-GB";

    return (
        <FieldSet legend={t("pages.settings.languages")}>
            <Select
                label={t("pages.settings.languages")}
                options={options}
                value={currentLanguage}
                onChange={handleChange}
            />
        </FieldSet>
    );
};
export default LanguageSettings;
