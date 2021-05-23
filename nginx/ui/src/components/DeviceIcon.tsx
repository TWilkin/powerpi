import {
  faHourglassHalf,
  faLayerGroup,
  faLightbulb,
  faLock,
  faPlug,
  faQuestion,
  faTv
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface DeviceIconProps {
  type: string;
}

const DeviceIcon = ({ type }: DeviceIconProps) => {
  return (
    <div className="device-icon">
      <FontAwesomeIcon icon={getDeviceTypeIcon(type)} />
    </div>
  );
};

function getDeviceTypeIcon(type: string) {
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
export default DeviceIcon;
