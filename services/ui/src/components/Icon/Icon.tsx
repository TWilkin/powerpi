import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import getIcon, { IconType } from "./IconLibrary";

const additionalProps: { [key in IconType]?: Omit<FontAwesomeIconProps, "icon"> } = {
    loading: { className: "animate-spin" },
};

type IconProps = {
    icon: IconType;
} & Pick<FontAwesomeIconProps, "className">;

const Icon = ({ icon, className, ...props }: IconProps) => (
    <FontAwesomeIcon
        {...props}
        {...additionalProps[icon]}
        icon={getIcon(icon)}
        className={classNames(className, additionalProps[icon]?.className)}
    />
);
export default Icon;
