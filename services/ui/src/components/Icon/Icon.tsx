import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import getIcon, { IconType } from "./IconLibrary";

const additionalProps: { [key in IconType]?: Omit<FontAwesomeIconProps, "icon"> } = {
    loading: { spin: true },
};

type IconProps = {
    icon: IconType;

    size?: "xs" | "m";
} & Omit<FontAwesomeIconProps, "icon" | "size">;

const Icon = ({ icon, size = "m", className, ...props }: IconProps) => (
    <FontAwesomeIcon
        {...props}
        {...additionalProps[icon]}
        icon={getIcon(icon)}
        className={classNames(className, { "icon-xs": size === "xs", "icon-m": size === "m" })}
    />
);
export default Icon;
