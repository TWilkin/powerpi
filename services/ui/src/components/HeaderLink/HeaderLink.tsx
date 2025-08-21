import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";
import HeaderLinkBody from "./HeaderLinkBody";

type HeaderLinkProps = CommonHeaderLinkProps &
    PropsWithChildren<{
        /** Whether to always show as a small link. */
        small?: boolean;
    }>;

/** Component for one of the main header navigation links. */
const HeaderLink = ({ route, icon, text, small = false, children }: HeaderLinkProps) => {
    const [showSubMenu, setShowSubMenu] = useState(false);

    const handleHover = useCallback(() => {
        if (!children) {
            // no action if it doesn't have a submenu
            return;
        }

        setShowSubMenu(true);
    }, [children]);

    return (
        <div className={classNames("h-20", { grow: !small })}>
            <HeaderLinkBody
                route={route}
                icon={icon}
                text={small ? undefined : text}
                onMouseEnter={handleHover}
            />

            {showSubMenu && <div className="relative flex flex-col z-50">{children}</div>}
        </div>
    );
};
export default HeaderLink;
