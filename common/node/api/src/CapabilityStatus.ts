import Capability from "./Capability";

export interface CapabilityStatusMessage {
    device: string;
    capability: Capability;
    timestamp: number;
}

export type CapabilityStatusCallback = (message: CapabilityStatusMessage) => void;
