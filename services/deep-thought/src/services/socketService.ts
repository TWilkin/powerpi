import { DeviceState } from "@powerpi/api";
import { ISensor } from "@powerpi/common";
import { $log } from "@tsed/common";
import { Nsp, SocketService } from "@tsed/socketio";
import { Namespace } from "socket.io";
import ConfigService from "./config";
import DeviceStateListener from "./listeners/DeviceStateListener";
import SensorStateListener from "./listeners/SensorStateListener";
import MqttService from "./mqtt";

@SocketService("/api")
export default class ApiSocketService {
    private readonly device: DeviceListener;
    private readonly sensors: SensorListener[];

    @Nsp
    namespace?: Namespace;

    constructor(configService: ConfigService, mqttService: MqttService) {
        this.namespace = undefined;

        this.device = new DeviceListener(mqttService, this);
        this.sensors = configService.sensors.map(
            (sensor) => new SensorListener(mqttService, sensor, this)
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

    onDeviceStateMessage(deviceName: string, state: DeviceState, timestamp?: number) {
        this.namespace?.emit("device", {
            device: deviceName,
            state,
            timestamp,
        });
    }

    onEventMessage(
        sensorName: string,
        state?: string,
        value?: number,
        unit?: string,
        timestamp?: number
    ) {
        this.namespace?.emit("sensor", {
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
        timestamp?: number
    ) {
        this.namespace?.emit("battery", {
            device: type === "device" ? name : undefined,
            sensor: type === "sensor" ? name : undefined,
            battery,
            charging,
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
    constructor(mqttService: MqttService, private readonly socketService: ApiSocketService) {
        super(mqttService);
    }

    protected onDeviceStateMessage(
        deviceName: string,
        state: DeviceState,
        timestamp?: number
    ): void {
        this.socketService.onDeviceStateMessage(deviceName, state, timestamp);
    }

    protected onDeviceBatteryMessage(
        deviceName: string,
        value: number,
        timestamp?: number | undefined,
        charging?: boolean | undefined
    ): void {
        this.socketService.onBatteryMessage("device", deviceName, value, charging, timestamp);
    }
}

class SensorListener extends SensorStateListener {
    constructor(
        mqttService: MqttService,
        sensor: ISensor,
        private readonly socketService: ApiSocketService
    ) {
        super(mqttService, sensor);
    }

    protected onSensorStateMessage(sensorName: string, state: string, timestamp?: number): void {
        this.socketService.onEventMessage(sensorName, state, undefined, undefined, timestamp);
    }

    protected onSensorDataMessage(
        sensorName: string,
        value: number,
        unit: string,
        timestamp?: number
    ): void {
        this.socketService.onEventMessage(sensorName, undefined, value, unit, timestamp);
    }

    protected onSensorBatteryMessage(
        sensorName: string,
        value: number,
        timestamp?: number,
        charging?: boolean
    ): void {
        this.socketService.onBatteryMessage("sensor", sensorName, value, charging, timestamp);
    }
}
