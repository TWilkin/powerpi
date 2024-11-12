import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import getIcon, { IconType } from "./IconLibrary";

const additionalProps: { [key in IconType]?: Omit<FontAwesomeIconProps, "icon"> } = {
    loading: { spin: true },
};

type IconProps = {
    icon: IconType;
} & Omit<FontAwesomeIconProps, "icon">;

const Icon = ({ icon, ...props }: IconProps) => (
    <FontAwesomeIcon {...props} {...additionalProps[icon]} icon={getIcon(icon)} />
);
export default Icon;
