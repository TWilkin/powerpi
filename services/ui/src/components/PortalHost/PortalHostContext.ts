import { createContext } from "react";

export type PortalHostContextType = {
    layer: number;
    dropdownHost: string;
    tooltipHost: string;
};

const PortalHostContext = createContext<PortalHostContextType>({
    layer: 0,
    dropdownHost: "dropdown-host",
    tooltipHost: "tooltip-host",
});
export default PortalHostContext;
