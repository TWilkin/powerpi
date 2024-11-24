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

    const { checked, label } = useMemo(() => {
        switch (device.state) {
            case DeviceState.On:
                return {
                    checked: true,
                    label: t("common.power off", { device: device.display_name }),
                };

            case DeviceState.Off:
                return {
                    checked: false,
                    label: t("common.power on", { device: device.display_name }),
                };

            case DeviceState.Unknown:
            default:
                return {
                    checked: undefined,
                    label: t("common.power on", { device: device.display_name }),
                };
        }
    }, [device.display_name, device.state, t]);

    const icon = useMemo(() => {
        if (isChangingState) {
            return "loading";
        }

        return device.state === DeviceState.On ? "stateOn" : "stateOff";
    }, [device.state, isChangingState]);

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
                    "focus-within:ring-offset-2 focus-within:ring-offset-outline-offset focus-within:ring-2 focus-within:ring-outline focus:z-10",
                    {
                        ["bg-green-800 hover:bg-green-700 active:bg-green-600"]:
                            device.state === DeviceState.On,
                        ["bg-red-800 hover:bg-red-700 active:bg-red-600 justify-end"]:
                            device.state === DeviceState.Off,
                        ["bg-gray-500 hover:bg-gray-400 active:bg-gray-300 justify-center"]:
                            device.state === DeviceState.Unknown,
                    },
                )}
                {...longPressProps()}
            >
                <Icon
                    icon={icon}
                    className={classNames("p-0.5 bg-white rounded-full", {
                        ["text-green-800 hover:text-green-700 active:text-green-600 ml-1"]:
                            device.state === DeviceState.On,
                        ["text-red-800 hover:text-red-700 active:text-red-600 mr-1"]:
                            device.state === DeviceState.Off,
                        ["text-gray-500 hover:text-gray-400 active:text-gray-300"]:
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
