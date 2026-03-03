import { ComponentProps, KeyboardEvent, useCallback, useContext, useEffect, useRef } from "react";
import { CommonHeaderLinkProps } from "./CommonHeaderLink";
import HeaderLinkBody from "./HeaderLinkBody";
import HeaderSubMenuContext from "./HeaderSubMenuContext";

type HeaderSubLinkProps = CommonHeaderLinkProps & ComponentProps<typeof HeaderLinkBody>;

const HeaderSubLink = ({ route, icon, text, ...props }: HeaderSubLinkProps) => {
    const index = useRef<number | null>(null);

    const ref = useRef<HTMLAnchorElement>(null);

    const {
        subMenuId,
        activeSubMenuIndex,
        registerSubMenuLink,
        closeSubMenu,
        focusNext,
        focusPrevious,
        focusFirst,
        focusLast,
    } = useContext(HeaderSubMenuContext);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowDown":
                    focusNext();
                    break;

                case "ArrowUp":
                    focusPrevious();
                    break;

                case "Home":
                    focusFirst();
                    break;

                case "End":
                    focusLast();
                    break;

                case "Escape":
                    closeSubMenu();
                    break;
            }
        },
        [closeSubMenu, focusFirst, focusLast, focusNext, focusPrevious],
    );

    useEffect(() => {
        index.current = registerSubMenuLink(ref);
    }, [registerSubMenuLink]);

    return (
        <HeaderLinkBody
            {...props}
            route={route}
            icon={icon}
            text={text}
            role="menuitem"
            tabIndex={index.current === activeSubMenuIndex ? 0 : -1}
            onKeyDown={handleKeyDown}
            aria-controls={subMenuId}
            ref={ref}
        />
    );
};
export default HeaderSubLink;
