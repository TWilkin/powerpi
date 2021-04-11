import {
  faFilter,
  faHistory,
  faHourglassHalf,
  faLayerGroup,
  faLightbulb,
  faLock,
  faPlug,
  faPowerOff,
  faQuestion,
  faSpinner,
  faTv
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, MouseEvent } from "react";
import { Link } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { Api, Device, DeviceState, SocketListener } from "../api";

interface DeviceListProps {
  api: Api;
}

interface LoadableDevice extends Device {
  loading: boolean;
}

interface DeviceListModel {
  devices: LoadableDevice[];
  filters: string[];
}

export default class DeviceList
  extends React.Component<DeviceListProps, DeviceListModel>
  implements SocketListener {
  constructor(props: DeviceListProps) {
    super(props);

    this.state = {
      devices: [],
      filters: [
        "composite",
        "harmony_activity",
        "lifx_light",
        "energenie_socket"
      ]
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handlePowerButton = this.handlePowerButton.bind(this);
    this.onMessage = this.onMessage.bind(this);

    this.props.api.addListener(this);
  }

  async componentDidMount() {
    this.setState({
      devices: (await this.props.api.getDevices()) as LoadableDevice[]
    });
  }

  render() {
    return (
      <>
        {this.renderFilters()}
        <br />
        {this.renderDeviceList()}
      </>
    );
  }

  renderFilters() {
    let types = this.state.devices.map((device) => device.type);
    types = types
      .filter((value, index) => types.indexOf(value) === index)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    return (
      <div id="device-filters" className="filters">
        <label>
          <FontAwesomeIcon
            icon={faFilter}
            onClick={() =>
              this.setState({
                filters: this.state.filters.length === 0 ? types : []
              })
            }
          />
        </label>

        {types.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              name="device-type"
              value={type}
              checked={this.state.filters.includes(type)}
              onChange={this.handleFilterChange}
            />
            {this.renderDeviceTypeIcon(type)}
            <div className="device-type">{type}</div>
          </label>
        ))}
      </div>
    );
  }

  renderDeviceList() {
    return (
      <div id="device-list" className="list">
        {this.state.devices
          .filter((device) => device.visible)
          .filter((device) => this.state.filters.includes(device.type))
          .map((device) => (
            <div
              key={device.name}
              className="device"
              title={`Device ${device.name} is currently ${device.state}.`}
            >
              {this.renderDeviceTypeIcon(device.type)}
              <div className="device-name">
                {device.display_name ?? device.name}
              </div>
              <div className="device-state">
                {this.renderPowerButtons(device)}
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
    );
  }

  renderPowerButtons(device: LoadableDevice) {
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
              onChange={this.handlePowerButton}
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
            onClick={(event) => this.handleSliderClick(event, device)}
          />
        </div>

        {device.loading ? (
          <div className="switch-toggle-spinner">
            <FontAwesomeIcon icon={faSpinner} spin={true} />
          </div>
        ) : null}
      </>
    );
  }

  renderDeviceTypeIcon(type: string) {
    return (
      <div className="device-icon">
        <FontAwesomeIcon icon={this.getDeviceTypeIcon(type)} />
      </div>
    );
  }

  public onMessage(message: {
    device: string;
    state: DeviceState;
    timestamp: number;
  }) {
    this.updateDeviceState(message.device, (device) => {
      device.state = message.state;
      device.since = message.timestamp;
      device.loading = false;
    });
  }

  private getDeviceTypeIcon(type: string) {
    switch (type) {
      case "composite":
        return faLayerGroup;

      case "delay":
        return faHourglassHalf;

      case "harmony_activity":
      case "harmony_hub":
        return faTv;

      case "lifx_light":
        return faLightbulb;

      case "mutex":
        return faLock;

      case "energenie_socket":
      case "energenie_socket_group":
        return faPlug;

      default:
        return faQuestion;
    }
  }

  private handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
    let filters = [...this.state.filters];

    if (event.target.checked) {
      filters.push(event.target.value);
    } else {
      filters = filters.filter((type) => type !== event.target.value);
    }

    this.setState({ filters });
  }

  private handlePowerButton(event: ChangeEvent<HTMLInputElement>) {
    const index = event.target.id.lastIndexOf("-");
    const device = event.target.id.slice(0, index);
    const state = event.target.id.slice(index + 1) as DeviceState;

    if (state === "on" || state === "off") {
      this.updateDeviceState(device, (d) => (d.loading = true));

      this.props.api.postMessage(device, state);
    }
  }

  private handleSliderClick(event: MouseEvent<HTMLDivElement>, device: Device) {
    event.preventDefault();

    if (device.state !== "unknown") {
      this.updateDeviceState(device.name, (d) => (d.loading = true));

      this.props.api.postMessage(device.name, device.state);
    }
  }

  private updateDeviceState(
    name: string,
    func: (device: LoadableDevice) => void
  ) {
    const index = this.state.devices.findIndex(
      (device) => device.name === name
    );

    if (index) {
      const devices = [...this.state.devices];
      const device = devices[index];

      func(device);
      devices[index] = device;

      this.setState({ devices });
    }
  }
}
