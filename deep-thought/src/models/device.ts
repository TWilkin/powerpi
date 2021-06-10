export interface DeviceConfig {
  name: string;
  display_name: string;
  type: string;
  visible: boolean;
}

export type DeviceState = "on" | "off" | "unknown";

export interface Device extends DeviceConfig {
  state: DeviceState;
  since: number;
}
