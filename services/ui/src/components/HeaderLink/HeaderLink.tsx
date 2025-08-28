import classNames from "classnames";
import { PropsWithChildren, useId } from "react";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";
import HeaderLinkBody from "./HeaderLinkBody";
import HeaderSubMenuContext from "./HeaderSubMenuContext";
import useSubMenu from "./useSubMenu";

type HeaderLinkProps = CommonHeaderLinkProps &
    PropsWithChildren<{
        /** Whether to always show as a small link. */
        small?: boolean;
    }>;

/** Component for one of the main header navigation links. */
const HeaderLink = ({ route, icon, text, small = false, children }: HeaderLinkProps) => {
    const { subMenuId, context, showSubMenu, handleClick, handleKeyDown, ref } =
        useSubMenu(!!children);

    const linkId = useId();

    return (
        <div className={classNames("h-20 group", { grow: !small })}>
            <HeaderLinkBody
                id={linkId}
                route={route}
                icon={icon}
                text={small ? undefined : text}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-haspopup={children ? "menu" : undefined}
                aria-expanded={children ? showSubMenu : undefined}
                ref={ref}
            />

            {children != null && (
                <div
                    id={subMenuId}
                    className={classNames("relative flex-col z-50", {
                        flex: showSubMenu,
                        "hidden group-hover:flex": !showSubMenu,
                    })}
                    role="menu"
                    aria-labelledby={linkId}
                >
                    <HeaderSubMenuContext.Provider value={context}>
                        {children}
                    </HeaderSubMenuContext.Provider>
                </div>
            )}
        </div>
    );
};
export default HeaderLink;
