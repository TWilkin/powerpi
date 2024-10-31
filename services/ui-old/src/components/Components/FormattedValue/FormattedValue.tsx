import { useMemo } from "react";
import useUserSettings from "../../../hooks/UserSettings";
import UnitConverter, { UnitType } from "../../../services/UnitConverter";

type FormattedValueProps = {
    type?: string;
    value?: number;
    unit?: string;
};

const FormattedValue = ({ type, value, unit }: FormattedValueProps) => {
    const settings = useUserSettings();

    const formattedValue = useMemo(() => {
        let desiredValue = value;
        let desiredUnit = unit;

        if (type && value != null && unit) {
            const unitType = type as UnitType;
            const userSelectedUnit = settings.units[unitType];

            if (userSelectedUnit && userSelectedUnit !== unit) {
                const converted = UnitConverter.convert(
                    unitType,
                    { value, unit },
                    userSelectedUnit,
                );

                desiredValue = converted.value;
                desiredUnit = converted.unit;
            }
        }

        return getFormattedValue(desiredValue, desiredUnit);
    }, [settings.units, type, unit, value]);

    return <>{formattedValue}</>;
};
export default FormattedValue;

export function getFormattedValue(value: number | undefined, unit: string | undefined) {
    if (value === undefined || !unit) {
        return undefined;
    }

    // does the value need rounding
    const rounded = value.toLocaleString();

    if (unit === "%") {
        return `${rounded}%`;
    }

    return `${rounded} ${getFormattedUnit(unit)}`;
}

export function getFormattedUnit(unit: string | undefined) {
    if (!unit) {
        return "";
    }

    if (unit === "m3") {
        return "m\u00B3";
    }

    return unit;
}
