import { $log } from "@tsed/common";
import { Nsp, SocketService } from "@tsed/socketio";
import { Namespace } from "socket.io";
import { DeviceState } from "../models/device";
import MqttService from "./mqtt";
import StateListener from "./stateListener";

@SocketService("/api")
export default class DeviceStateSocketService extends StateListener {
    @Nsp
    namespace?: Namespace;

    constructor(mqttService: MqttService) {
        super(mqttService);

        this.namespace = undefined;
    }

    $onNamespaceInit(namespace: Namespace) {
        $log.info("Socket namespace initialised.");
        this.namespace = namespace;
    }

    onStateMessage(deviceName: string, state: DeviceState, timestamp?: number) {
        this.namespace?.emit("message", {
            device: deviceName,
            state,
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
