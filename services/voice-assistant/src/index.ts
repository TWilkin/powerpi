import { ExpressJs, Request, Response, Webhook } from "@jovotech/server-express";
import { LoggerService, PowerPiService } from "@powerpi/common";
import HttpStatus from "http-status-codes";
import app from "./app";
import Container from "./container";
import ConfigService from "./services/ConfigService";
import HealthService from "./services/HealthService";

async function start() {
    const config = Container.get(ConfigService);
    const logger = Container.get(LoggerService);
    const health = Container.get(HealthService);

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

    Webhook.get("/health", async (_, response: Response) => {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        const status = health.execute();

        response
            .status(status ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
            .send(status);
    })
}

const service = Container.get(PowerPiService);
service.start(start);
