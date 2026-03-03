import classNames from "classnames";
import { OptionProps, components } from "react-select";
import Icon from "../Icon";
import { OptionType } from "./types";

type SelectOptionProps<TValueType> = OptionProps<OptionType<TValueType>>;

const SelectOption = <TValueType,>({
    label,
    data,
    children,
    isSelected,
    isFocused,
    ...props
}: SelectOptionProps<TValueType>) => {
    return (
        <components.Option
            {...props}
            label={label}
            data={data}
            isSelected={isSelected}
            isFocused={isFocused}
            className={classNames(
                "p relative",
                "!flex flex-row gap items-center whitespace-nowrap !cursor-pointer",
                "hover:bg-bg-hover",
                {
                    "bg-bg-primary": !isSelected && !isFocused,
                    "bg-bg-selected": isSelected && !isFocused,
                    "bg-bg-hover ring-2 ring-outline z-focus": isFocused,
                },
            )}
        >
            {data.icon && <Icon icon={data.icon} />} {children}
        </components.Option>
    );
};
export default SelectOption;
