import { Message } from "@powerpi/common";
import { Capability } from "@powerpi/common-api";

export interface CapabilityMessage extends Capability, Message {}

export default interface CapabilityStateListener {
    onCapabilityMessage(entity: string, message: CapabilityMessage): void;
}
