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
        <components.SingleValue {...props} data={data} className="p flex flex-row gap items-center">
            {data.icon && <Icon icon={data.icon} />} {children}
        </components.SingleValue>
    );
};
export default SelectSingleValue;
