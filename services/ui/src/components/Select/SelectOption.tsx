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
                "p-2 relative",
                "!flex flex-row gap-2 items-center whitespace-nowrap !cursor-pointer",
                "text-black dark:text-white",
                "hover:bg-sky-300 hover:dark:bg-purple-800",
                {
                    "bg-sky-400 dark:bg-purple-900": !isSelected && !isFocused,
                    "bg-sky-200 dark:bg-purple-950": isSelected && !isFocused,
                    "bg-sky-300 dark:bg-purple-800 ring-2 ring-black dark:ring-white z-10":
                        isFocused,
                },
            )}
        >
            {data.icon && <Icon icon={data.icon} />} {children}
        </components.Option>
    );
};
export default SelectOption;
