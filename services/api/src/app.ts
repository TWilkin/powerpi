import { PowerPiService } from "@powerpi/common";
import { $log } from "@tsed/common";
import { importProviders } from "@tsed/components-scan";
import { PlatformExpress } from "@tsed/platform-express";
import Container from "./Container";
import Server from "./Server";

const rootDir = __dirname;

async function bootstrap() {
    try {
        const scannedProviders = await importProviders({
            mount: {
                "/api": [`${rootDir}/controllers/*.ts`],
            },
            imports: [`${rootDir}/services/*.ts`, `${rootDir}/protocols/*.ts`],
        });

        const platform = await PlatformExpress.bootstrap(Server, { ...scannedProviders });
        await platform.listen();

        process.on("SIGINT", () => {
            platform.stop();
        });
    } catch (er) {
        $log.error(er);
    }
}

const service = Container.get(PowerPiService);
service.start(bootstrap);
