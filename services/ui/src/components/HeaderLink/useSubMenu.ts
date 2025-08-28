import { KeyboardEvent, RefObject, useCallback, useId, useMemo, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { HeaderSubMenuContextType } from "./HeaderSubMenuContext";

export default function useSubMenu(hasChildren: boolean) {
    const [showSubMenu, setShowSubMenu] = useState(false);
    const [subMenuRefs, setSubMenuRefs] = useState<RefObject<HTMLAnchorElement | null>[]>([]);
    const [activeSubMenuIndex, setActiveSubMenuIndex] = useState<number | null>(null);

    const subMenuId = useId();

    const ref = useOnClickOutside<HTMLAnchorElement>(() => setShowSubMenu(false));

    const registerSubMenuLink = useCallback((ref: RefObject<HTMLAnchorElement | null>) => {
        let newIndex: number = -1;

        setSubMenuRefs((prev) => {
            newIndex = prev.length;

            return [...prev, ref];
        });

        return newIndex;
    }, []);

    const focus = useCallback(
        (index: number) => {
            setActiveSubMenuIndex(index);
            subMenuRefs[index]?.current?.focus();
        },
        [subMenuRefs],
    );

    const focusNext = useCallback(
        () => focus((activeSubMenuIndex ?? -1) + 1),
        [activeSubMenuIndex, focus],
    );

    const focusPrevious = useCallback(
        () => focus(((activeSubMenuIndex ?? 0) - 1 + subMenuRefs.length) % subMenuRefs.length),
        [activeSubMenuIndex, focus, subMenuRefs.length],
    );

    const focusFirst = useCallback(() => focus(0), [focus]);
    const focusLast = useCallback(() => focus(subMenuRefs.length - 1), [focus, subMenuRefs.length]);

    const openSubMenu = useCallback(() => {
        setShowSubMenu(true);

        setTimeout(focusFirst, 0);
    }, [focusFirst]);

    const closeSubMenu = useCallback(() => {
        setShowSubMenu(false);
        setActiveSubMenuIndex(null);

        ref.current?.focus();
    }, [ref]);

    const context: HeaderSubMenuContextType = useMemo(
        () => ({
            subMenuId,
            activeSubMenuIndex,

            registerSubMenuLink,
            closeSubMenu,
            focusNext,
            focusPrevious,
            focusFirst,
            focusLast,
        }),
        [
            activeSubMenuIndex,
            closeSubMenu,
            focusNext,
            focusPrevious,
            focusFirst,
            focusLast,
            registerSubMenuLink,
            subMenuId,
        ],
    );

    const handleClick = useCallback(() => {
        const isTouchDevice = window.matchMedia("(hover: none)").matches;

        if (isTouchDevice) {
            openSubMenu();
        }
    }, [openSubMenu]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!hasChildren) {
                return;
            }

            switch (event.key) {
                case "Enter":
                case " ":
                case "ArrowDown":
                    openSubMenu();
                    break;
            }
        },
        [hasChildren, openSubMenu],
    );

    return {
        subMenuId,
        context,
        showSubMenu,
        handleClick,
        handleKeyDown,
        ref,
    };
}
