export type ConfigStatusMessage = { entity: string };

export type ConfigStatusCallback = (message: ConfigStatusMessage) => Promise<void>;
