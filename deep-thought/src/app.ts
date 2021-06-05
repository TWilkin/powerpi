import { Configuration, ServerLoader } from "@tsed/common";
import bodyParser from "body-parser";
import cors from "cors";
import Path from "path";
import "reflect-metadata";

const rootDir = Path.resolve(__dirname);

@Configuration({
  rootDir,
  httpPort: 3000,
  httpsPort: false,
  mount: {
    "/api": [`${rootDir}/controllers/*.ts`]
  },
  componentsScan: [`${rootDir}/services/*.ts`],
  socketIO: {
    path: "/api/socket.io"
  },
  acceptMimes: ["application/json"]
})
export default class Server extends ServerLoader {
  public $beforeRoutesInit() {
    this.use(
      cors({
        origin: true,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "X-User"]
      })
    ).use(bodyParser.json());
  }
}

new Server().start();
