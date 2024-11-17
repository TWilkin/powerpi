type BatteryDeviceMessage = {
    device: string;
};

type BatterySensorMessage = {
    sensor: string;
};

/** Socket.io message emitted when device/sensor's battery level or charging status changes. */
export type BatteryStatusMessage = {
    battery: number;

    charging?: boolean;

    timestamp: number;
} & (BatteryDeviceMessage | BatterySensorMessage);

export type BatteryStatusCallback = (message: BatteryStatusMessage) => void;
