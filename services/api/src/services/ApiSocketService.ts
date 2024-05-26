import { AdditionalState, Capability, DeviceState, SocketIONamespace } from "@powerpi/common-api";
import { $log } from "@tsed/common";
import { Nsp, SocketService } from "@tsed/socketio";
import { Namespace } from "socket.io";

@SocketService("/api")
export default class ApiSocketService {
    @Nsp
    namespace?: Namespace;

    constructor() {
        this.namespace = undefined;
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
        state?: string,
        value?: number,
        unit?: string,
        timestamp?: number,
    ) {
        this.namespace?.emit(SocketIONamespace.Sensor, {
            sensor: sensorName,
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

    $onConnection() {
        $log.info("Client connected to socket.");
    }

    $onDisconnect() {
        $log.info("Client disconnected from socket.");
    }
}
