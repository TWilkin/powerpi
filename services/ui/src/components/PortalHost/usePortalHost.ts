import { useCallback, useContext } from "react";
import PortalHostContext from "./PortalHostContext";

/** Hook providing the current host ids and a function to retrieve the host element to use
 * when rendering with a portal. */
export default function usePortalHost() {
    const getElementByHostId = useCallback(
        (hostId: string) => document.getElementById(hostId) ?? document.body,
        [],
    );

    const context = useContext(PortalHostContext);

    return {
        ...context,
        getElementByHostId,
    };
}
