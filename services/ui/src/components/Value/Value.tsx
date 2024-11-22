import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useConversion from "../../hooks/useConversion";
import { getUnitLabel, getUnitType, isSupportedUnit } from "../../services/UnitConverter";

type ValueProps = {
    type?: string;

    value?: number;

    unit?: string;
};

/** Component to display a value and unit, using the translations/formatting and conversions. */
const Value = ({ type, value, unit }: ValueProps) => {
    const { t } = useTranslation();

    const converter = useConversion();

    const text = useMemo(() => {
        if (value != null && unit) {
            let unitValue = { value, unit };

            if (type) {
                const unitType = getUnitType(type, unit);

                if (unitType) {
                    unitValue = converter(unitType, unitValue);
                }
            }

            if (isSupportedUnit(unitValue.unit)) {
                const label = getUnitLabel(unitValue.unit);

                if (label) {
                    return t(`common.units.values.${label}`, { value: unitValue.value });
                }
            }

            return t("common.units.values.unrecognised", { value, unit });
        }

        return undefined;
    }, [converter, t, type, unit, value]);

    if (value == null) {
        return <></>;
    }

    return <>{text}</>;
};
export default Value;
