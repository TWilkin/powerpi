import { useContext } from "react";
import PortalHostContext from "./PortalHostContext";

export default function usePortalHost() {
    return useContext(PortalHostContext);
}
