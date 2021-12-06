import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { Device, DeviceState, PowerPiApi } from "powerpi-common-api";
import React, { MouseEvent, useState } from "react";
import { useLongPress } from "use-long-press";
import { useSetDeviceState } from "../hooks/devices";

interface DevicePowerButtonProps {
    api: PowerPiApi;
    device: Device;
}

const DevicePowerButton = ({ api, device }: DevicePowerButtonProps) => {
    const [toggle, setToggle] = useState(true);

    const { updateDeviceState, isDeviceStateLoading, changeState } = useSetDeviceState(api, device);

    // handle a click on the slider to toggle
    const handleSliderClick = async (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        let newState = DeviceState.On;
        if (isDeviceStateLoading && changeState !== DeviceState.Unknown) {
            // if we're loading just repeat the current state
            newState = changeState;
        } else {
            if (device.state === DeviceState.On) {
                // the only state change that isn't to on is from on to off
                newState = DeviceState.Off;
            }
        }

        await updateDeviceState(newState);
    };

    // handle a click on a button
    const handleButtonClick = async (
        event: MouseEvent<HTMLButtonElement>,
        newState: DeviceState
    ) => {
        event.preventDefault();

        await updateDeviceState(newState);

        setToggle(true);
    };

    // support long press to change button type
    const longPress = useLongPress(() => {
        setToggle(false);
    });

    // show the power toggle control
    if (toggle) {
        return (
            <div className="slider" onClick={handleSliderClick} {...longPress}>
                <span
                    className={classNames(
                        "slider-bar",
                        { on: device.state === DeviceState.On },
                        { off: device.state === DeviceState.Off },
                        { unknown: device.state === DeviceState.Unknown },
                        { loading: isDeviceStateLoading }
                    )}
                />
            </div>
        );
    }

    // show an on/off button
    return (
        <div className="buttons">
            <button className="on" onClick={(event) => handleButtonClick(event, DeviceState.On)}>
                <FontAwesomeIcon icon={faPowerOff} />
            </button>
            <button className="off" onClick={(event) => handleButtonClick(event, DeviceState.Off)}>
                <FontAwesomeIcon icon={faPowerOff} />
            </button>
        </div>
    );
};
export default DevicePowerButton;
