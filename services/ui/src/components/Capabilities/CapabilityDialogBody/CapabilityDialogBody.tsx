import { Device } from "@powerpi/common-api";
import DevicePowerToggle from "../../DevicePowerToggle";

type CapabilityDialogBody = {
    device: Device;
};

const CapabilityDialogBody = ({ device }: CapabilityDialogBody) => (
    <div className="flex flex-col gap-2 items-center">
        <DevicePowerToggle device={device} />
    </div>
);
export default CapabilityDialogBody;
