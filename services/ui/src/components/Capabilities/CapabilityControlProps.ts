import { Device } from "@powerpi/common-api";
import useMutateDeviceState from "../../queries/useMutateDeviceState";

/** Props common to each of the capability controls. */
type CapabilityControlProps = {
    /** The device the control adjusts. */
    device: Device;

    /** Whether the control should be disabled or not, i.e. when sending a change request. */
    disabled: boolean;

    /** The mutation to send the update to when the control is adjusted. */
    mutateAsync: ReturnType<typeof useMutateDeviceState>["mutateAsync"];
};
export default CapabilityControlProps;
