interface FormattedValueProps {
    value?: number;
    unit?: string;
}

const FormattedValue = ({ value, unit }: FormattedValueProps) => (
    <>{getFormattedValue(value, unit)}</>
);
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
