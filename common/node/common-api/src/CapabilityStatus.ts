import Capability from "./Capability.js";

export interface CapabilityStatusMessage {
    device: string;
    capability: Capability;
    timestamp: number;
}

export type CapabilityStatusCallback = (message: CapabilityStatusMessage) => void;
