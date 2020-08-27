export interface DeviceConfig {
    name: string;
    type: string;
};

export interface Device extends DeviceConfig {
    state: 'on' | 'off' | 'unknown';
};
