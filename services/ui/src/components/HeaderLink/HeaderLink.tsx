import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
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

    const toggleSubMenu = useCallback((newState: boolean) => {
        const isTouchDevice = window.matchMedia("(hover: none)").matches;

        if (isTouchDevice) {
            setShowSubMenu(newState);
        }
    }, []);

    const handleClick = useCallback(() => toggleSubMenu(true), [toggleSubMenu]);

    const ref = useOnClickOutside<HTMLAnchorElement>(() => toggleSubMenu(false));

    return (
        <div className={classNames("h-20 group", { grow: !small })}>
            <HeaderLinkBody
                route={route}
                icon={icon}
                text={small ? undefined : text}
                onClick={handleClick}
                ref={ref}
            />

            <div
                className={classNames("relative flex-col z-50", {
                    flex: showSubMenu,
                    "hidden group-hover:flex": !showSubMenu,
                })}
            >
                {children}
            </div>
        </div>
    );
};
export default HeaderLink;
