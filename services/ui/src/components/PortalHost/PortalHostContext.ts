import { createContext } from "react";

export type PortalHostContextType = {
    layer: number | undefined;
    dropdownHost: string;
    tooltipHost: string;
};

const PortalHostContext = createContext<PortalHostContextType>({
    layer: undefined,
    dropdownHost: "dropdown-host",
    tooltipHost: "tooltip-host",
});
export default PortalHostContext;
