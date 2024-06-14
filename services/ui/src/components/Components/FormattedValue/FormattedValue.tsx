import { useMemo } from "react";
import useUserSettings from "../../../hooks/useUserSettings";
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

    switch (unit.toLowerCase()) {
        case "%":
            return `${value}%`;

        default:
            return `${value} ${getFormattedUnit(unit)}`;
    }
}

export function getFormattedUnit(unit: string | undefined) {
    if (!unit) {
        return "";
    }

    switch (unit.toLowerCase()) {
        case "m3":
            return "m\u00B3";

        default:
            return unit;
    }
}
