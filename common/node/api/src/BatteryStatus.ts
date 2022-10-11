export interface BatteryStatusMessage {
    device?: string;
    sensor?: string;
    battery: number;
    charging?: boolean;
    timestamp: number;
}

export type BatteryStatusCallback = (message: BatteryStatusMessage) => void;
