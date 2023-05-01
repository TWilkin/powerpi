import { faLock, faLockOpen, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Device, DeviceState } from "@powerpi/api";
import classNames from "classnames";
import { MouseEvent, useMemo, useState } from "react";
import { useLongPress } from "use-long-press";
import { useSetDeviceState } from "../../../hooks/devices";
import Button from "../Button";
import styles from "./DevicePowerButton.module.scss";

interface DevicePowerButtonProps {
    device: Device;
}

const DevicePowerButton = ({ device }: DevicePowerButtonProps) => {
    const [toggle, setToggle] = useState(true);

    const { updateDeviceState, isDeviceStateLoading, changeState } = useSetDeviceState(device);

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
    const longPress = useLongPress(() => setToggle(false));

    const isLock = useMemo(() => device.type.endsWith("pairing"), [device.type]);

    // show the power toggle control
    if (toggle) {
        return (
            <div className={styles.slider} onClick={handleSliderClick} {...longPress}>
                <span
                    className={classNames(
                        styles.bar,
                        { [styles.lock]: isLock },
                        { [styles.on]: device.state === DeviceState.On },
                        { [styles.off]: device.state === DeviceState.Off },
                        { [styles.unknown]: device.state === DeviceState.Unknown },
                        { [styles.loading]: isDeviceStateLoading }
                    )}
                />
            </div>
        );
    }

    // show an on/off button
    return (
        <div
            className={classNames(styles.buttons, {
                [styles.lock]: isLock,
            })}
        >
            <Button
                className={styles.on}
                onClick={(event) => handleButtonClick(event, DeviceState.On)}
                icon={isLock ? faLockOpen : faPowerOff}
            />

            <Button
                className={styles.off}
                onClick={(event) => handleButtonClick(event, DeviceState.Off)}
                icon={isLock ? faLock : faPowerOff}
            />
        </div>
    );
};
export default DevicePowerButton;
