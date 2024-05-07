import { ConfigFileType, ConfigRetrieverService, ISensor } from "@powerpi/common";
import { AdditionalState, Capability, DeviceState, SocketIONamespace } from "@powerpi/common-api";
import { $log } from "@tsed/common";
import { Nsp, SocketService } from "@tsed/socketio";
import { Namespace } from "socket.io";
import ConfigService from "./ConfigService";
import MqttService from "./MqttService";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
import DeviceStateListener from "./listeners/DeviceStateListener";
import SensorStateListener from "./listeners/SensorStateListener";

@SocketService("/api")
export default class ApiSocketService {
    private readonly device: DeviceListener;
    private readonly sensors: SensorListener[];

    @Nsp
    namespace?: Namespace;

    constructor(
        configService: ConfigService,
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
    ) {
        this.namespace = undefined;

        this.device = new DeviceListener(configRetriever, mqttService, this);

        this.sensors = configService.sensors.map(
            (sensor) => new SensorListener(configRetriever, mqttService, sensor, this),
        );
    }

    async $onInit() {
        await Promise.all([
            this.device.$onInit(),
            ...this.sensors.map((sensor) => sensor.$onInit()),
        ]);
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

class DeviceListener extends DeviceStateListener {
    constructor(
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
        private readonly socketService: ApiSocketService,
    ) {
        super(configRetriever, mqttService);
    }

    protected onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number,
        additionalState?: AdditionalState,
    ): void {
        this.socketService.onDeviceStateMessage(deviceName, state, timestamp, additionalState);
    }

    protected onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number | undefined,
        charging?: boolean | undefined,
    ): void {
        this.socketService.onBatteryMessage("device", deviceName, value, charging, timestamp);
    }

    onCapabilityMessage(deviceName: string, message: CapabilityMessage): void {
        const capability = { ...message };
        delete capability.timestamp;
        this.socketService.onCapabilityMessage(deviceName, capability, message.timestamp);
    }

    protected onConfigChange(_: ConfigFileType) {}
}

class SensorListener extends SensorStateListener {
    constructor(
        configRetriever: ConfigRetrieverService,
        mqttService: MqttService,
        sensor: ISensor,
        private readonly socketService: ApiSocketService,
    ) {
        super(configRetriever, mqttService, sensor);
    }

    protected onSensorStateMessage(sensorName: string, state: string, timestamp?: number): void {
        this.socketService.onEventMessage(sensorName, state, undefined, undefined, timestamp);
    }

    protected onSensorDataMessage(
        sensorName: string,
        value: number,
        unit: string,
        timestamp?: number,
    ): void {
        this.socketService.onEventMessage(sensorName, undefined, value, unit, timestamp);
    }

    protected onSensorBatteryMessage(
        sensorName: string,
        value: number,
        timestamp?: number,
        charging?: boolean,
    ): void {
        this.socketService.onBatteryMessage("sensor", sensorName, value, charging, timestamp);
    }

    protected onConfigChange(_: ConfigFileType) {}
}
