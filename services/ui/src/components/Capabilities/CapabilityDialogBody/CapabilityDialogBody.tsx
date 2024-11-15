import { Device } from "@powerpi/common-api";
import { useState } from "react";
import DevicePowerToggle from "../../DevicePowerToggle";
import Slider from "../../Slider";

type CapabilityDialogBody = {
    device: Device;
};

const CapabilityDialogBody = ({ device }: CapabilityDialogBody) => {
    const [value, setValue] = useState(3);

    return (
        <div className="flex flex-col gap-2 items-center">
            <DevicePowerToggle device={device} />

            <Slider
                lowIcon="capability"
                highIcon="capability"
                label="Set your brightness"
                min={1}
                max={100}
                value={value}
                onChange={setValue}
                onSettled={() => {}}
            />
        </div>
    );
};
export default CapabilityDialogBody;
