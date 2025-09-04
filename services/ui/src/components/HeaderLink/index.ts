import HeaderLinkComponent from "./HeaderLink";
import HeaderSubLink from "./HeaderSubLink";

type HeaderLinkCompoundComponent = typeof HeaderLinkComponent & {
    SubLink: typeof HeaderSubLink;
};

const HeaderLink = HeaderLinkComponent as HeaderLinkCompoundComponent;
HeaderLink.SubLink = HeaderSubLink;

export default HeaderLink;
