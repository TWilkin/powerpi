import { MqttService } from "@powerpi/common";
import { registerProvider } from "@tsed/di";
import Container from "../Container.js";

// add services here from common which we rely on and need to get from typedi especially if they're Singletons
registerProvider({
    provide: MqttService,
    useFactory: () => Container.get(MqttService),
});
