import { Message } from "@powerpi/common";

export interface BatteryMessage extends Message {
    state?: string;
    value?: number;
    unit?: string;
    charging?: boolean;
}

export default abstract class BatteryStateListener {
    protected batteryMessage(entity: string, message: BatteryMessage) {
        if (message.value !== undefined) {
            this.onBatteryMessage(
                entity,
                message.value,
                message.timestamp,
                message.charging ?? false
            );
        }
    }

    protected abstract onBatteryMessage(
        entity: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ): void;
}
