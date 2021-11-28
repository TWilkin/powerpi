import { Injectable, ProviderScope, ProviderType } from "@tsed/common";
import { MqttService as CommonMqttService } from "powerpi-common";
import Container from "../container";

@Injectable({
    type: ProviderType.VALUE,
    scope: ProviderScope.SINGLETON,
    useFactory: () => Container.get(CommonMqttService),
})
export default class MqttService extends CommonMqttService {}
