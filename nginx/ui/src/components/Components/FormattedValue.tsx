interface FormattedValueProps {
    value?: number;
    unit?: string;
}

const FormattedValue = ({ value, unit }: FormattedValueProps) => {
    if (value === undefined || !unit) {
        return <></>;
    }

    switch (unit.toLowerCase()) {
        case "%":
            return <>{`${value}%`}</>;

        case "m3":
            return (
                <>
                    {value} m<sup>3</sup>
                </>
            );

        default:
            return <>{`${value} ${unit}`}</>;
    }
};
export default FormattedValue;
