import { SingleValueProps, components } from "react-select";
import Icon from "../Icon";
import { OptionType } from "./types";

type SelectSingleValueProps<TValueType> = SingleValueProps<OptionType<TValueType>>;

const SelectSingleValue = <TValueType,>({
    data,
    children,
    ...props
}: SelectSingleValueProps<TValueType>) => {
    return (
        <components.SingleValue
            {...props}
            data={data}
            className="p-2 flex flex-row gap-2 items-center"
        >
            {data.icon && <Icon icon={data.icon} />} {children}
        </components.SingleValue>
    );
};
export default SelectSingleValue;
