import { faPowerOff, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, MouseEvent } from "react";
import { DeviceState, PowerPiApi } from "powerpi-common-api";

import { LoadableDevice } from "./DeviceList";

interface DevicePowerButtonProps {
  api: PowerPiApi;
  device: LoadableDevice;
  setLoading: (device: LoadableDevice) => void;
}

const DevicePowerButton = ({
  api,
  device,
  setLoading
}: DevicePowerButtonProps) => {
  const handlePowerButton = (event: ChangeEvent<HTMLInputElement>) => {
    const index = event.target.id.lastIndexOf("-");
    const state = event.target.id.slice(index + 1) as DeviceState;

    if (state === "on" || state === "off") {
      setLoading(device);

      api.postMessage(device.name, state);
    }
  };

  const handleSliderClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (device.state !== "unknown") {
      setLoading(device);

      api.postMessage(device.name, device.state);
    }
  };

  return (
    <>
      <div className="switch-toggle">
        {["on", "unknown", "off"].map((state) => (
          <input
            key={state}
            type="radio"
            id={`${device.name}-${state}`}
            name={`${device.name}-state`}
            className={`switch-${state}`}
            checked={device.state === state}
            onChange={handlePowerButton}
          />
        ))}

        <label htmlFor={`${device.name}-on`} className="switch-on">
          <FontAwesomeIcon icon={faPowerOff} />
        </label>
        <label htmlFor={`${device.name}-unknown`} className="switch-unknown">
          &nbsp;
        </label>
        <label htmlFor={`${device.name}-off`} className="switch-off">
          <FontAwesomeIcon icon={faPowerOff} />
        </label>

        <div
          id={`${device.name}-slider`}
          className="switch-toggle-slider"
          onClick={handleSliderClick}
        />
      </div>

      {device.loading ? (
        <div className="switch-toggle-spinner">
          <FontAwesomeIcon icon={faSpinner} spin={true} />
        </div>
      ) : null}
    </>
  );
};

export default DevicePowerButton;
