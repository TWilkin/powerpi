import { Request, Response } from "express";
import { ExpressJS, Lambda, Webhook } from "jovo-framework";
import app from "./app";

// ExpressJS (Jovo Webhook)
if (process.argv.indexOf("--webhook") > -1) {
  const port = process.env.JOVO_PORT || 3000;
  Webhook.jovoApp = app;

  Webhook.listen(port, () => {
    console.info(`Local server listening on port ${port}.`);
  });

  Webhook.post("/webhook", async (request: Request, response: Response) => {
    await app.handle(new ExpressJS(request, response));
  });
}

// AWS Lambda
export const handler = async (event: any, context: any, callback: Function) => {
  await app.handle(new Lambda(event, context, callback));
};
