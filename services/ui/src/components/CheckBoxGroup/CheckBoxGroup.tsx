import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import _ from "underscore";
import CheckBox from "../CheckBox/CheckBox";

type CheckBoxGroupOption<TValueType> = {
    label: ReactNode;

    value: TValueType;
};

type CheckBoxGroupProps<TValueType> = {
    options: CheckBoxGroupOption<TValueType>[];

    selections: TValueType[];

    onChange(selection: TValueType[]): void;
};

const CheckBoxGroup = <TValueType,>({
    options,
    selections,
    onChange,
}: CheckBoxGroupProps<TValueType>) => {
    const { t } = useTranslation();

    const allChecked = useMemo(() => {
        if (selections.length === 0) {
            return false;
        }
        if (selections.length === options.length) {
            return true;
        }

        return undefined;
    }, [options.length, selections.length]);

    const handleAllToggle = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;

            if (checked) {
                onChange(options.map((option) => option.value));
            } else {
                onChange([]);
            }
        },
        [onChange, options],
    );

    const handleSelectionToggle = useCallback(
        (value: TValueType, checked: boolean) => {
            let newSelections = [...selections];

            if (checked) {
                newSelections.push(value);
            } else {
                const index = newSelections.indexOf(value);
                if (index !== -1) {
                    newSelections.splice(index, 1);
                }
            }

            newSelections = _(newSelections).unique();

            onChange(newSelections);
        },
        [onChange, selections],
    );

    return (
        <>
            <CheckBox
                label={t("common.all")}
                checked={allChecked ?? false}
                indeterminate={allChecked === undefined}
                onChange={handleAllToggle}
            />

            {options.map((option) => (
                <CheckBoxGroupChild
                    {...option}
                    key={`${option.value}`}
                    selections={selections}
                    onChange={handleSelectionToggle}
                />
            ))}
        </>
    );
};
export default CheckBoxGroup;

type CheckBoxGroupChildProps<TValueType> = CheckBoxGroupOption<TValueType> &
    Pick<CheckBoxGroupProps<TValueType>, "selections"> & {
        onChange(value: TValueType, checked: boolean): void;
    };

const CheckBoxGroupChild = <TValueType,>({
    label,
    value,
    selections,
    onChange,
}: CheckBoxGroupChildProps<TValueType>) => {
    const checked = useMemo(() => selections.includes(value), [selections, value]);

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => onChange(value, event.target.checked),
        [onChange, value],
    );

    return <CheckBox label={label} checked={checked} onChange={handleChange} />;
};
