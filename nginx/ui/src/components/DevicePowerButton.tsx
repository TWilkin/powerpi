import classNames from "classnames";
import { DeviceState, PowerPiApi } from "powerpi-common-api";
import React, { MouseEvent, useEffect, useState } from "react";

interface DevicePowerButtonProps {
  api: PowerPiApi;
  device: string;
  state: DeviceState;
}

const DevicePowerButton = ({ api, device, state }: DevicePowerButtonProps) => {
  const [changeState, setChangeState] = useState(DeviceState.Unknown);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [state]);

  const handleClick = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    let newState = DeviceState.On;
    if (loading && changeState !== DeviceState.Unknown) {
      // if we're loading just repeat the current state
      newState = changeState;
    } else {
      if (state === DeviceState.On) {
        // the only state change that isn't to on is from on to off
        newState = DeviceState.Off;
      }
    }

    setChangeState(newState);
    await api.postMessage(device, newState);
  };

  return (
    <div className="slider" onClick={handleClick}>
      <span
        className={classNames(
          "slider-bar",
          { on: state === DeviceState.On },
          { off: state === DeviceState.Off },
          { unknown: state === DeviceState.Unknown }
        )}
      />
    </div>
  );
};

export default DevicePowerButton;
