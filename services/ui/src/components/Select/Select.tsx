import classNames from "classnames";
import { HTMLAttributes, useCallback, useMemo, useState } from "react";
import ReactSelect, { SingleValue } from "react-select";
import _ from "underscore";
import { inputStyles } from "../Input";
import SelectDropDownIndicator from "./SelectDropDownIndicator";
import SelectOption from "./SelectOption";
import SelectSingleValue from "./SelectSingleValue";
import { OptionType } from "./types";

type SelectProps<TValueType> = {
    label: string;

    value: TValueType | undefined;

    options: OptionType<TValueType>[];

    disabled?: boolean;

    onChange(value: TValueType): void;
} & Pick<HTMLAttributes<HTMLElement>, "id">;

const Select = <TValueType,>({
    id,
    label,
    value,
    options,
    disabled,
    onChange,
    ...props
}: SelectProps<TValueType>) => {
    const currentValue = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    );

    const sortedOptions = useMemo(
        () => _(options).sortBy((option) => option.label.toLocaleLowerCase()),
        [options],
    );

    const [menuOpen, setMenuOpen] = useState(false);
    const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
    const handleMenuClose = useCallback(() => setMenuOpen(false), []);

    const handleChange = useCallback(
        (newValue: SingleValue<OptionType<TValueType>>) => {
            if (newValue) {
                onChange(newValue.value);
            }
        },
        [onChange],
    );

    return (
        <div className="w-full min-w-40 sm:min-w-64 flex">
            <ReactSelect
                {...props}
                inputId={id}
                isSearchable
                isMulti={false}
                menuPosition="fixed"
                placeholder={label}
                options={sortedOptions}
                value={currentValue}
                isDisabled={disabled}
                components={{
                    Option: SelectOption,
                    SingleValue: SelectSingleValue,
                    DropdownIndicator: () => SelectDropDownIndicator({ isMenuOpen: menuOpen }),
                }}
                unstyled
                className={classNames(
                    inputStyles,
                    "w-full flex-1 border-2 border-outline cursor-pointer",
                    { "opacity-50": disabled },
                )}
                classNames={{
                    placeholder: () => "p",
                    input: () => classNames("p cursor-pointer", { "cursor-not-allowed": disabled }),
                    menu: () => "mt-2 rounded border-2 border-outline",
                }}
                aria-label={label}
                onChange={handleChange}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
            />
        </div>
    );
};
export default Select;
