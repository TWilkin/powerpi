import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Device, DeviceStatusMessage, PowerPiApi } from "powerpi-common-api";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
import DeviceFilter, { Filters } from "./DeviceFilter";
import DeviceIcon from "./DeviceIcon";
import DevicePowerButton from "./DevicePowerButton";
import Filter from "./Filter";
import Loading from "./Loading";

interface DeviceListProps {
  api: PowerPiApi;
}

const DeviceList = ({ api }: DeviceListProps) => {
  const [devices, setDevices] = useState<Device[] | undefined>(undefined);
  const [filters, setFilters] = useState<Filters>({ types: [] });
  const [loading, setLoading] = useState(true);

  // load initial device list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const result = await api.getDevices();
        setDevices(result);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // handle socket.io updates
  useEffect(() => {
    const onStatusUpdate = (message: DeviceStatusMessage) => {
      if (!devices) {
        return;
      }

      const newDevices = [...devices];

      const index = newDevices.findIndex(
        (device) => device.name === message.device
      );
      if (index) {
        newDevices[index] = { ...newDevices[index] };
        newDevices[index].state = message.state;
        newDevices[index].since = message.timestamp;

        setDevices(newDevices);
      }
    };

    api.addListener(onStatusUpdate);
    return () => api.removeListener(onStatusUpdate);
  }, [devices, setDevices]);

  return (
    <>
      <Filter>
        <DeviceFilter devices={devices} updateFilters={setFilters} />
      </Filter>

      <div id="device-list" className="list">
        <Loading loading={loading}>
          <table>
            <tbody>
              {devices
                ?.filter(
                  (device) =>
                    device.visible &&
                    (filters.types.length === 0 ||
                      filters.types.includes(device.type))
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
                        device={device.name}
                        state={device.state}
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
