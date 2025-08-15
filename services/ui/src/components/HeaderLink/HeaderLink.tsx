import classNames from "classnames";
import { PropsWithChildren } from "react";
import { buttonStyles } from "../Button";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";
import HeaderLinkBody from "./HeaderLinkBody";

type HeaderLinkProps = CommonHeaderLinkProps &
    PropsWithChildren<{
        /** Whether to always show as a small link. */
        small?: boolean;
    }>;

const headerLinkClasses = classNames(
    "relative h-full flex flex-row justify-center items-center gap-sm grow text-2xl",
    buttonStyles("default"),
    // when the link is the current route
    "aria-current-page:bg-bg-selected",
);

/** Component for one of the main header navigation links. */
const HeaderLink = ({ route, icon, text, small = false }: HeaderLinkProps) => (
    <div className={classNames("h-20", { grow: !small })}>
        <HeaderLinkBody
            route={route}
            icon={icon}
            text={small ? text : undefined}
            className={headerLinkClasses}
        />
    </div>
);
export default HeaderLink;
