import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { PowerPiService } from "powerpi-common";
import Container from "./container";
import Server from "./Server";

async function bootstrap() {
    try {
        const platform = await PlatformExpress.bootstrap(Server);
        await platform.listen();
    } catch (er) {
        $log.error(er);
    }
}

const service = Container.get(PowerPiService);
service.start(bootstrap);
