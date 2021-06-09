import { Request, Response } from "express";
import { ExpressJS, WebhookVerified as Webhook } from "jovo-framework";
import app from "./app";

if (process.argv.indexOf("--webhook") > -1) {
  const port = process.env.JOVO_PORT || 3000;
  Webhook.jovoApp = app;

  Webhook.listen(port, () => {
    console.info(`Local server listening on port ${port}.`);
  });

  Webhook.post(
    ["/webhook", "/webhook_alexa"],
    async (request: Request, response: Response) => {
      await app.handle(new ExpressJS(request, response));
    }
  );
}
