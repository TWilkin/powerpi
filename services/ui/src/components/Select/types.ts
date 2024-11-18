import { IconType } from "../Icon";

export type OptionType<TValueType> = {
    label: string;

    icon?: IconType;

    value: TValueType;
};
