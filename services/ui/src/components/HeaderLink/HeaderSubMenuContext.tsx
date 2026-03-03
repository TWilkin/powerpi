import { createContext, RefObject } from "react";

export type HeaderSubMenuContextType = {
    subMenuId: string;
    activeSubMenuIndex: number | null;

    registerSubMenuLink: (ref: RefObject<HTMLAnchorElement | null>) => number;
    closeSubMenu(): void;

    focusNext(): void;
    focusPrevious(): void;
    focusFirst(): void;
    focusLast(): void;
};

const HeaderSubMenuContext = createContext<HeaderSubMenuContextType>({
    subMenuId: "",
    activeSubMenuIndex: null,

    registerSubMenuLink: () => -1,
    closeSubMenu: () => {},

    focusNext: () => {},
    focusPrevious: () => {},
    focusFirst: () => {},
    focusLast: () => {},
});
export default HeaderSubMenuContext;
