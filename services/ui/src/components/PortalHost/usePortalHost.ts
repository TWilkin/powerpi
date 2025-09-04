import { useCallback, useContext } from "react";
import PortalHostContext from "./PortalHostContext";

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
