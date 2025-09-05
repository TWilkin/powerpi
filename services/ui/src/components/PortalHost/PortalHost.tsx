import { Fragment, PropsWithChildren, useContext, useId, useMemo } from "react";
import { DialogHost } from "../Dialog";
import PortalHostContext from "./PortalHostContext";
import usePortalHost from "./usePortalHost";

type PortalHostProps = PropsWithChildren<unknown>;

const PortalHost = ({ children }: PortalHostProps) => {
    const { layer } = useContext(PortalHostContext);

    const dropdownHost = useId();
    const tooltipHost = useId();

    const context = useMemo(
        () => ({ layer: layer == null ? 0 : layer + 1, dropdownHost, tooltipHost }),
        [dropdownHost, layer, tooltipHost],
    );

    return (
        <PortalHostContext.Provider value={context}>
            <PortalHostInner>{children}</PortalHostInner>
        </PortalHostContext.Provider>
    );
};
export default PortalHost;

const PortalHostInner = ({ children }: PortalHostProps) => {
    const { layer, dropdownHost, tooltipHost } = usePortalHost();

    const Wrapper = layer === 0 ? DialogHost : Fragment;

    return (
        <Wrapper>
            {children}
            <div id={dropdownHost} className="fixed z-portal-overlay" />
            <div id={tooltipHost} className="fixed z-portal-overlay" />
        </Wrapper>
    );
};
