import { Configuration, PlatformApplication } from "@tsed/common";
import "reflect-metadata";
import bodyParser = require("body-parser");
import cors = require("cors");

const rootDir = __dirname;

@Configuration({
  rootDir,
  httpPort: 3000,
  httpsPort: false,
  mount: {
    "/api": [`${rootDir}/controllers/*.ts`]
  },
  componentsScan: [`${rootDir}/services/*.ts`, `${rootDir}/protocols/*.ts`],
  socketIO: {
    path: "/api/socket.io"
  },
  acceptMimes: ["application/json"]
})
export default class Server {
  constructor(private app: PlatformApplication) {}

  public $beforeRoutesInit() {
    this.app
      .use(
        cors({
          origin: true,
          methods: ["GET", "POST"],
          allowedHeaders: ["Content-Type", "X-User"]
        })
      )
      .use(bodyParser.json());
  }
}
