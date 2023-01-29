import { Capability } from "@powerpi/api";
import { Message } from "@powerpi/common";

export interface CapabilityMessage extends Capability, Message {}

export default interface CapabilityStateListener {
    onCapabilityMessage(entity: string, message: CapabilityMessage): void;
}
