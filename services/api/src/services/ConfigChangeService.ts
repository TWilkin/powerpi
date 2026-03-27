import { MqttService } from "@powerpi/common";
import { Injectable } from "@tsed/di";
import ApiSocketService from "./ApiSocketService.js";
import ConfigChangeListener from "./listeners/ConfigChangeListener.js";

@Injectable({ eager: true })
export default class ConfigChangeService extends ConfigChangeListener {
    constructor(
        mqttService: MqttService,
        private readonly socket: ApiSocketService,
    ) {
        super(mqttService);
    }

    onConfigChangeMessage(entity: string, _: object, __: string, ___: number): void {
        this.socket.onConfigChange(entity);
    }
}
