import { CommonHeaderLinkProps } from "./CommonHeaderLink";
import HeaderLinkBody from "./HeaderLinkBody";

const HeaderSubLink = ({ route, icon, text }: CommonHeaderLinkProps) => {
    return <HeaderLinkBody route={route} icon={icon} text={text} />;
};
export default HeaderSubLink;
