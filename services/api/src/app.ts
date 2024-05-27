import { PowerPiService } from "@powerpi/common";
import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import Container from "./Container";
import Server from "./Server";

async function bootstrap() {
    try {
        const platform = await PlatformExpress.bootstrap(Server);

        process.on("SIGINT", async () => {
            platform.stop();
            await service.stop();
        });

        await platform.listen();
    } catch (er) {
        $log.error(er);
    }
}

const service = Container.get(PowerPiService);
service.start(bootstrap);
