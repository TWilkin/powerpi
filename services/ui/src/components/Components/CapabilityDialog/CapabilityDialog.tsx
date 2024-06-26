import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Device } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import _ from "underscore";
import { useSetDeviceAdditionalState } from "../../../hooks/useGetDevices";
import BrightnessSlider from "../Controls/BrightnessSlider";
import ColourSlider from "../Controls/ColourSlider";
import ColourTemperatureSlider from "../Controls/ColourTemperatureSlider";
import StreamSelect from "../Controls/StreamSelect";
import DeviceIcon from "../DeviceIcon";
import DevicePowerButton from "../DevicePowerButton";
import Dialog, { useDialog } from "../Dialog";
import styles from "./CapabilityDialog.module.scss";

type CapabilityDialogProps = {
    device: Device;
};

const CapabilityDialog = ({ device }: CapabilityDialogProps) => {
    const { showDialog, closeDialog, toggleDialog } = useDialog();

    const { capabilities, temperatureRange, streams } = useMemo(
        () => getCapabilities(device),
        [device],
    );
    const hasCapability = useMemo(
        () => _(capabilities).any((capability) => capability),
        [capabilities],
    );

    const { updateDeviceAdditionalState, isDeviceAdditionalStateLoading } =
        useSetDeviceAdditionalState(device);

    return (
        <>
            <div
                className={classNames({ [styles.clickable]: hasCapability })}
                onClick={hasCapability ? toggleDialog : undefined}
                title={hasCapability ? "Show capability menu" : undefined}
            >
                <DeviceIcon type={device.type} />

                {hasCapability && <FontAwesomeIcon icon={faGear} className={styles.gear} />}
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
                    <div className={styles.dialog}>
                        <DevicePowerButton device={device} />

                        {capabilities.brightness && (
                            <BrightnessSlider
                                brightness={device.additionalState?.brightness}
                                disabled={isDeviceAdditionalStateLoading}
                                onChange={updateDeviceAdditionalState}
                            />
                        )}

                        {capabilities.temperature && (
                            <ColourTemperatureSlider
                                temperature={device.additionalState?.temperature}
                                min={temperatureRange.min}
                                max={temperatureRange.max}
                                disabled={isDeviceAdditionalStateLoading}
                                onChange={updateDeviceAdditionalState}
                            />
                        )}

                        {capabilities.colour && (
                            <ColourSlider
                                hue={device.additionalState?.hue}
                                saturation={device.additionalState?.saturation}
                                brightness={device.additionalState?.brightness}
                                disabled={isDeviceAdditionalStateLoading}
                                onChange={updateDeviceAdditionalState}
                            />
                        )}

                        {capabilities.streams && (
                            <StreamSelect
                                streams={streams!}
                                stream={device.additionalState?.stream}
                                disabled={isDeviceAdditionalStateLoading}
                                onChange={updateDeviceAdditionalState}
                            />
                        )}
                    </div>
                </Dialog>
            )}
        </>
    );
};
export default CapabilityDialog;

function getCapabilities(device: Device) {
    const capabilities = {
        brightness: device.capability?.brightness ?? false,
        temperature: false,
        colour:
            (device.capability?.colour?.hue ?? false) &&
            (device.capability?.colour?.saturation ?? false),
        streams: device.capability?.streams !== undefined,
    };

    let temperatureRange = { min: 0, max: 0 };
    const streams = device.capability?.streams;

    if (device.capability?.colour?.temperature) {
        capabilities.temperature = true;
        temperatureRange = device.capability?.colour?.temperature as {
            min: number;
            max: number;
        };
    }

    return {
        capabilities,
        temperatureRange,
        streams,
    };
}
