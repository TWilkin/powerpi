import classNames from "classnames";
import { HTMLAttributes, useCallback, useMemo, useState } from "react";
import ReactSelect, { SingleValue } from "react-select";
import _ from "underscore";
import { inputStyles } from "../Input";
import SelectDropDownIndicator from "./SelectDropDownIndicator";
import SelectLoadingIndicator from "./SelectLoadingIndicator";
import SelectOption from "./SelectOption";
import SelectSingleValue from "./SelectSingleValue";
import { OptionType } from "./types";

type SelectProps<TValueType> = {
    label: string;

    value: TValueType | undefined;

    options: OptionType<TValueType>[];

    disabled?: boolean;

    loading?: boolean;

    onChange(value: TValueType): void;
} & Pick<HTMLAttributes<HTMLElement>, "id">;

const Select = <TValueType,>({
    id,
    label,
    value,
    options,
    disabled,
    loading,
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
                isLoading={loading}
                components={{
                    Option: SelectOption,
                    SingleValue: SelectSingleValue,
                    DropdownIndicator: () => SelectDropDownIndicator({ isMenuOpen: menuOpen }),
                    LoadingIndicator: SelectLoadingIndicator,
                }}
                unstyled
                className={classNames(
                    inputStyles,
                    "w-full flex-1 border border-outline cursor-pointer",
                    { "opacity-50": disabled },
                )}
                classNames={{
                    placeholder: () => "p",
                    input: () => classNames("p cursor-pointer", { "cursor-not-allowed": disabled }),
                    menu: () => "mt-2 rounded border border-outline",
                    menuList: () => "scrollbar-thin",
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
