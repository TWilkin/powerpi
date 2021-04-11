import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { Api, Device, DeviceState } from "../api";
import DeviceFilter, { Filters } from "./DeviceFilter";
import DeviceIcon from "./DeviceIcon";
import DevicePowerButton from "./DevicePowerButton";

interface DeviceListProps {
  api: Api;
}

export interface LoadableDevice extends Device {
  loading: boolean;
}

const DeviceList = ({ api }: DeviceListProps) => {
  const [devices, setDevices] = useState([] as LoadableDevice[]);
  const [filters, setFilters] = useState({} as Filters);

  useEffect(() => {
    (async () => {
      const result = await api.getDevices();
      setDevices(result as LoadableDevice[]);
    })();
  }, []);

  const updateDevice = (
    name: string,
    update: (device: LoadableDevice) => void
  ) => {
    const newDevices = [...devices];

    const instance = newDevices.filter((d) => d.name === name)[0];
    if (instance) {
      update(instance);
      setDevices(newDevices);
    }
  };

  const setLoading = (device: LoadableDevice) =>
    updateDevice(device.name, (d) => (d.loading = true));

  const onStatusUpdate = (message: {
    device: string;
    state: DeviceState;
    timestamp: number;
  }) =>
    updateDevice(message.device, (d) => {
      d.state = message.state;
      d.since = message.timestamp;
      d.loading = false;
    });

  api.addListener({ onMessage: onStatusUpdate });

  return (
    <>
      <DeviceFilter devices={devices} updateFilters={setFilters} />
      <br />

      <div id="device-list" className="list">
        {devices
          .filter(
            (device) => device.visible && filters.types.includes(device.type)
          )
          .map((device) => (
            <div
              key={device.name}
              className="device"
              title={`Device ${device.name} is currently ${device.state}.`}
            >
              <DeviceIcon type={device.type} />
              <div className="device-name">
                {device.display_name ?? device.name}
              </div>
              <div className="device-state">
                <DevicePowerButton
                  api={api}
                  device={device}
                  setLoading={setLoading}
                />
              </div>
              <div className="device-since">
                {device.since && device.since > -1 && (
                  <ReactTimeAgo date={device.since} locale="en-GB" />
                )}
              </div>
              <div className="device-history">
                <Link to={`/history?type=device&entity=${device.name}`}>
                  <FontAwesomeIcon icon={faHistory} />
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default DeviceList;
