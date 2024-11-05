import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import getIcon, { IconType } from "./IconLibrary";

type IconProps = {
    icon: IconType;
} & Omit<FontAwesomeIconProps, "icon">;

const Icon = ({ icon, ...props }: IconProps) => <FontAwesomeIcon {...props} icon={getIcon(icon)} />;
export default Icon;
