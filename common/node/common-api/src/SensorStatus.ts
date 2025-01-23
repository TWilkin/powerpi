export interface SensorStatusMessage {
    sensor: string;
    action: string;
    state?: string;
    value?: number;
    unit?: string;
    timestamp: number;
}

export type SensorStatusCallback = (message: SensorStatusMessage) => void;
