import DeviceState from "./DeviceState";

interface Device {
  name: string;
  display_name: string;
  visible: boolean;
  type: string;
  state: DeviceState;
  since: number;
}

export default Device;
