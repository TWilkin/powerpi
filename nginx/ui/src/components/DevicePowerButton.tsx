import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { DeviceState, PowerPiApi } from "powerpi-common-api";
import React, { MouseEvent, useEffect, useState } from "react";
import { useLongPress } from "use-long-press";

interface DevicePowerButtonProps {
  api: PowerPiApi;
  device: string;
  state: DeviceState;
}

const DevicePowerButton = ({ api, device, state }: DevicePowerButtonProps) => {
  const [changeState, setChangeState] = useState(DeviceState.Unknown);
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [state]);

  // set to loading and make the state change API call
  const updateState = async (newState: DeviceState) => {
    setLoading(true);

    setChangeState(newState);

    await api.postMessage(device, newState);
  };

  // handle a click on the slider to toggle
  const handleSliderClick = async (event: MouseEvent<HTMLDivElement>) => {
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

    await updateState(newState);
  };

  // handle a click on a button
  const handleButtonClick = async (
    event: MouseEvent<HTMLButtonElement>,
    newState: DeviceState
  ) => {
    event.preventDefault();

    await updateState(newState);

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
            { on: state === DeviceState.On },
            { off: state === DeviceState.Off },
            { unknown: state === DeviceState.Unknown },
            { loading }
          )}
        />
      </div>
    );
  }

  // show an on/off button
  return (
    <div className="buttons">
      <button
        className="on"
        onClick={(event) => handleButtonClick(event, DeviceState.On)}
      >
        <FontAwesomeIcon icon={faPowerOff} />
      </button>
      <button
        className="off"
        onClick={(event) => handleButtonClick(event, DeviceState.Off)}
      >
        <FontAwesomeIcon icon={faPowerOff} />
      </button>
    </div>
  );
};
export default DevicePowerButton;
