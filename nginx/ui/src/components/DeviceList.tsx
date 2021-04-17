import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { Api, Device, DeviceState } from "../api";
import DeviceFilter, { Filters } from "./DeviceFilter";
import DeviceIcon from "./DeviceIcon";
import DevicePowerButton from "./DevicePowerButton";
import Loading from "./Loading";

interface DeviceListProps {
  api: Api;
}

export interface LoadableDevice extends Device {
  loading: boolean;
}

const DeviceList = ({ api }: DeviceListProps) => {
  const [devices, setDevices] = useState<LoadableDevice[] | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<Filters>({ types: [] });

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
    if (!devices) {
      return;
    }

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
        <Loading loading={!devices}>
          <table>
            <tbody>
              {devices
                ?.filter(
                  (device) =>
                    device.visible && filters.types.includes(device.type)
                )
                .map((device) => (
                  <tr
                    key={device.name}
                    className="device"
                    title={`Device ${device.name} is currently ${device.state}.`}
                  >
                    <td>
                      <DeviceIcon type={device.type} />
                    </td>

                    <td className="device-name">
                      {device.display_name ?? device.name}
                    </td>

                    <td className="device-state">
                      <DevicePowerButton
                        api={api}
                        device={device}
                        setLoading={setLoading}
                      />
                    </td>

                    <td className="device-since">
                      {device.since && device.since > -1 && (
                        <ReactTimeAgo date={device.since} locale="en-GB" />
                      )}
                    </td>

                    <td className="device-history">
                      <Link to={`/history?type=device&entity=${device.name}`}>
                        <FontAwesomeIcon icon={faHistory} />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Loading>
      </div>
    </>
  );
};

export default DeviceList;
