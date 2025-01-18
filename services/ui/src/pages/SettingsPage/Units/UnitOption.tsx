import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chain as _ } from "underscore";
import Select from "../../../components/Select";
import useUserSettings from "../../../hooks/useUserSettings";
import UnitConverter, { SupportedUnit, UnitType } from "../../../services/UnitConverter";

type UnitOption = {
    type: Exclude<UnitType, "volume">;

    value: string | undefined;

    dispatch: ReturnType<typeof useUserSettings>["dispatch"];
};

/** Component to select the unit for a specific type of value. */
const UnitOption = ({ type, value, dispatch }: UnitOption) => {
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            _(UnitConverter.getConverters(type))
                .map((option) => {
                    const label = t(`common.units.labels.${option.key}`);
                    const unit = t(`common.units.values.${option.key}`, { value: 1 })
                        .replaceAll("1", "")
                        .trim();

                    return {
                        label: `${label} (${unit})`,
                        value: option.unit,
                    };
                })
                .sortBy((conversion) => conversion.label.toLocaleLowerCase())
                .value(),
        [t, type],
    );

    const handleChange = useCallback(
        (value: SupportedUnit) => {
            if (dispatch) {
                dispatch({ type: "Unit", unitType: type, unit: value });
            }
        },
        [dispatch, type],
    );

    const id = `unit-settings-${type}`;

    return (
        <>
            <label htmlFor={id}>{t(`common.sensors.labels.${type}`)}:</label>

            <Select
                id={id}
                label={t(`common.sensors.labels.${type}`)}
                options={options}
                value={value}
                onChange={handleChange}
            />
        </>
    );
};
export default UnitOption;
