import { ConfigChangeListener, ConfigFileType, ConfigRetrieverService } from "@powerpi/common";
import { AdditionalState, Capability, DeviceState, SocketIONamespace } from "@powerpi/common-api";
import { $log } from "@tsed/common";
import { Nsp, SocketService } from "@tsed/socketio";
import { Namespace } from "socket.io";

@SocketService("/api")
export default class ApiSocketService implements ConfigChangeListener {
    @Nsp
    namespace?: Namespace;

    constructor(configRetrieverService: ConfigRetrieverService) {
        this.namespace = undefined;

        // add config change listeners for the types the services that use the API will be interested in
        configRetrieverService.addListener(ConfigFileType.Devices, this);
        configRetrieverService.addListener(ConfigFileType.Floorplan, this);
    }

    $onNamespaceInit(namespace: Namespace) {
        $log.info("Socket namespace initialised.");
        this.namespace = namespace;
    }

    onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number,
        additionalState?: AdditionalState,
    ) {
        this.namespace?.emit(SocketIONamespace.Device, {
            device: deviceName,
            state,
            timestamp,
            additionalState,
        });
    }

    onEventMessage(
        sensorName: string,
        action?: string,
        state?: string,
        value?: number,
        unit?: string,
        timestamp?: number,
    ) {
        this.namespace?.emit(SocketIONamespace.Sensor, {
            sensor: sensorName,
            action,
            state,
            value,
            unit,
            timestamp,
        });
    }

    onBatteryMessage(
        type: "device" | "sensor",
        name: string,
        battery: number,
        charging?: boolean,
        timestamp?: number,
    ) {
        this.namespace?.emit(SocketIONamespace.Battery, {
            device: type === "device" ? name : undefined,
            sensor: type === "sensor" ? name : undefined,
            battery,
            charging,
            timestamp,
        });
    }

    onCapabilityMessage(deviceName: string, capability: Capability, timestamp?: number) {
        this.namespace?.emit(SocketIONamespace.Capability, {
            device: deviceName,
            capability,
            timestamp,
        });
    }

    onConfigChange(type: ConfigFileType) {
        this.namespace?.emit(SocketIONamespace.Config, {
            type,
        });
    }

    $onConnection() {
        $log.info("Client connected to socket.");
    }

    $onDisconnect() {
        $log.info("Client disconnected from socket.");
    }
}
