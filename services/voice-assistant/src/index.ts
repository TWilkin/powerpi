import { ExpressJs, Request, Response, Webhook } from "@jovotech/server-express";
import { LoggerService, PowerPiService } from "@powerpi/common";
import app from "./app";
import Container from "./container";
import ConfigService from "./services/ConfigService";

async function start() {
    const config = Container.get(ConfigService);
    const logger = Container.get(LoggerService);

    await app.initialize();

    Webhook.listen(config.port, () => {
        logger.info("Local server listening on port", config.port);
    });

    Webhook.get("/webhook", async (request: Request, response: Response) => {
        const result = await app.handle(new ExpressJs(request, response));
        response.json(result);
    });

    Webhook.post("/webhook_alexa", async (request: Request, response: Response) => {
        await app.handle(new ExpressJs(request, response));
    });
}

const service = Container.get(PowerPiService);
service.start(start);
