export interface DeviceConfig {
    name: string;
    type: string;
};

export type DeviceState = 'on' | 'off' | 'unknown';

export interface Device extends DeviceConfig {
    state: DeviceState;
    since: number;
};
