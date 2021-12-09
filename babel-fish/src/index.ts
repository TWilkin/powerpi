import { LoggerService, PowerPiService } from "@powerpi/common";
import { Request, Response } from "express";
import { ExpressJS, WebhookVerified as Webhook } from "jovo-framework";
import app from "./app";
import Container from "./container";
import ConfigService from "./services/config";

function start() {
    const config = Container.get(ConfigService);
    const logger = Container.get(LoggerService);

    Webhook.jovoApp = app;

    Webhook.listen(config.port, () => {
        logger.info("Local server listening on port", config.port);
    });

    Webhook.post(["/webhook_alexa"], async (request: Request, response: Response) => {
        await app.handle(new ExpressJS(request, response));
    });
}

const service = Container.get(PowerPiService);
service.start(start);
