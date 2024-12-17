import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export default function useDeviceChangingState() {
    return useContext(NotificationContext);
}
