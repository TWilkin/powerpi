import { Message } from "@powerpi/common";
import { AdditionalState, DeviceState } from "@powerpi/common-api";

export type ChangeMessage = Message &
    AdditionalState & {
        state?: DeviceState;
    };

export default interface DeviceChangeListener {
    onDeviceChangeMessage(entity: string, message: ChangeMessage): void;
}
