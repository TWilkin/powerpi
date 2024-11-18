import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import ReactSelect, { SingleValue } from "react-select";
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
};

const Select = <TValueType,>({
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
        <div className="w-80 flex">
            <ReactSelect
                {...props}
                isSearchable
                isMulti={false}
                menuPosition="fixed"
                placeholder={label}
                options={options}
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
                    "flex-1 border-2 border-black dark:border-white cursor-pointer",
                    { "opacity-50": disabled },
                )}
                classNames={{
                    placeholder: () => "p-2",
                    input: () =>
                        classNames("p-2 cursor-pointer", { "cursor-not-allowed": disabled }),
                    menu: () => "mt-2 rounded border-2 border-black dark:border-white",
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
