import { Device } from "@powerpi/api";
import classNames from "classnames";
import { useMemo } from "react";
import _ from "underscore";
import DeviceIcon from "../DeviceIcon";
import Dialog, { useDialog } from "../Dialog";
import styles from "./CapabilityDialog.module.scss";

type CapabilityDialogProps = {
    device: Device;
};

const CapabilityDialog = ({ device }: CapabilityDialogProps) => {
    const { showDialog, closeDialog, toggleDialog } = useDialog();

    const capabilities = useMemo(() => getCapabilities(device), [device]);
    const hasCapability = useMemo(
        () => _(capabilities).any((capability) => capability),
        [capabilities]
    );

    return (
        <>
            <div
                className={classNames({ [styles.clickable]: hasCapability })}
                onClick={hasCapability ? toggleDialog : undefined}
            >
                <DeviceIcon type={device.type} />
            </div>

            {hasCapability && showDialog && (
                <Dialog
                    title={
                        <>
                            <DeviceIcon type={device.type} />
                            {device.display_name}
                        </>
                    }
                    closeDialog={closeDialog}
                >
                    Boop
                </Dialog>
            )}
        </>
    );
};
export default CapabilityDialog;

function getCapabilities(device: Device) {
    const capbility = {
        brightness: device.capability?.brightness ?? false,
        temperature: false,
        colour: device.capability?.colour?.hue ?? false,
    };

    if (device.capability?.colour?.temperature) {
        capbility.temperature = true;
    }

    return capbility;
}
