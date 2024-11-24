import { Device, DeviceState } from "@powerpi/common-api";
import classNames from "classnames";
import { LabelHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLongPress } from "use-long-press";
import { useDeviceChangingState } from "../../queries/notifications";
import useMutateDeviceState from "../../queries/useMutateDeviceState";
import DevicePowerButton from "../DevicePowerButton";
import Icon from "../Icon";

type PowerButtonType = "toggle" | "individual";

type DevicePowerToggleProps = {
    device: Device;
} & LabelHTMLAttributes<HTMLLabelElement>;

const DevicePowerToggle = ({ device, ...props }: DevicePowerToggleProps) => {
    const { t } = useTranslation();

    const [buttonType, setButtonType] = useState<PowerButtonType>("toggle");

    const ref = useRef<HTMLInputElement>(null);

    const { mutateAsync } = useMutateDeviceState(device);

    const { changingState } = useDeviceChangingState();
    const isChangingState = useMemo(() => {
        if (changingState) {
            return changingState[device.name];
        }

        return false;
    }, [changingState, device.name]);

    const handleCheckChange = useCallback(async () => {
        let newState = DeviceState.On;

        if (isChangingState && device.state !== DeviceState.Unknown) {
            // if we're loading just repeat the current state
            newState = device.state;
        } else if (device.state === DeviceState.On) {
            // the only state change that isn't to on is from on to off
            newState = DeviceState.Off;
        }

        await mutateAsync({ newState });
    }, [device.state, isChangingState, mutateAsync]);

    const handleButtonTypeSwitch = useCallback(() => setButtonType("toggle"), []);

    const longPressProps = useLongPress(() => setButtonType("individual"));

    const isLock = useMemo(() => device.type.endsWith("pairing"), [device.type]);

    const { checked, label } = useMemo(() => {
        const key = isLock ? "lock" : "power";

        switch (device.state) {
            case DeviceState.On:
                return {
                    checked: true,
                    label: t(`common.${key} off`, { device: device.display_name }),
                };

            case DeviceState.Off:
                return {
                    checked: false,
                    label: t(`common.${key} on`, { device: device.display_name }),
                };

            case DeviceState.Unknown:
            default:
                return {
                    checked: undefined,
                    label: t(`common.${key} on`, { device: device.display_name }),
                };
        }
    }, [device.display_name, device.state, isLock, t]);

    const icon = useMemo(() => {
        if (isChangingState) {
            return "loading";
        }

        if (isLock) {
            return device.state === DeviceState.On ? "stateUnlocked" : "stateLocked";
        }

        return device.state === DeviceState.On ? "stateOn" : "stateOff";
    }, [device.state, isChangingState, isLock]);

    // the checkbox is indeterminate when the state is unknown
    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = device.state === DeviceState.Unknown;
        }
    }, [device.state]);

    if (buttonType === "toggle") {
        return (
            <label
                {...props}
                className={classNames(
                    "h-6 w-12 flex flex-row items-center rounded-full select-none cursor-pointer",
                    "focus-within:ring-offset focus-within:ring-offset-outline-offset focus-within:ring focus-within:ring-outline focus:z-10",
                    {
                        ["bg-on hover:bg-on-hover active:bg-on-active"]:
                            !isLock && device.state === DeviceState.On,
                        ["bg-off hover:bg-off-hover active:bg-off-active justify-end"]:
                            !isLock && device.state === DeviceState.Off,
                        ["bg-lock hover:bg-lock-hover active:bg-lock-active"]:
                            isLock && device.state === DeviceState.Off,
                        ["bg-unlock hover:bg-unlock-hover active:bg-unlock-active justify-end"]:
                            isLock && device.state === DeviceState.On,
                        ["bg-unknown hover:bg-unknown-hover active:bg-unknown-active justify-center"]:
                            device.state === DeviceState.Unknown,
                    },
                )}
                {...longPressProps()}
            >
                <Icon
                    icon={icon}
                    className={classNames("p-xs bg-white rounded-full text-sm", {
                        ["text-on hover:text-on-hover active:text-on-active ml-1"]:
                            !isLock && device.state === DeviceState.On,
                        ["text-off hover:text-off-hover active:text-off-active mr-1"]:
                            !isLock && device.state === DeviceState.Off,
                        ["text-lock hover:text-lock-hover active:text-lock-active ml-1"]:
                            isLock && device.state === DeviceState.Off,
                        ["text-unlock hover:text-unlock-hover active:text-unlock-active mr-1"]:
                            isLock && device.state === DeviceState.On,
                        ["text-unknown hover:text-unknown-hover active:text-unknown-active"]:
                            device.state === DeviceState.Unknown,
                    })}
                />

                <input
                    type="checkbox"
                    checked={checked}
                    className="w-0 h-0"
                    aria-label={label}
                    onChange={handleCheckChange}
                    ref={ref}
                />
            </label>
        );
    }

    return <DevicePowerButton device={device} onPowerChange={handleButtonTypeSwitch} />;
};
export default DevicePowerToggle;
