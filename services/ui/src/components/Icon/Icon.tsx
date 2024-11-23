import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import getIcon, { IconType } from "./IconLibrary";

const additionalProps: { [key in IconType]?: Omit<FontAwesomeIconProps, "icon"> } = {
    loading: { spin: true },
};

type IconProps = {
    icon: IconType;
} & Omit<FontAwesomeIconProps, "icon" | "size">;

const Icon = ({ icon, className, ...props }: IconProps) => (
    <FontAwesomeIcon
        {...props}
        {...additionalProps[icon]}
        icon={getIcon(icon)}
        className={className}
    />
);
export default Icon;
