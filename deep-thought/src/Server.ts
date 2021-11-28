import { Configuration, PlatformApplication } from "@tsed/common";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import "reflect-metadata";
import Config from "./services/config";

const rootDir = __dirname;

@Configuration({
    rootDir,
    httpPort: 3000,
    httpsPort: false,
    mount: {
        "/api": [`${rootDir}/controllers/*.ts`],
    },
    componentsScan: [`${rootDir}/services/*.ts`, `${rootDir}/protocols/*.ts`],
    socketIO: {
        path: "/api/socket.io",
    },
    acceptMimes: ["application/json"],
})
export default class Server {
    constructor(private config: Config, private app: PlatformApplication) {}

    public async $beforeRoutesInit() {
        if (this.config.usesHttps) {
            this.app.getApp().set("trust proxy", 1);
        }

        this.app
            .use(cookieParser())
            .use(
                cors({
                    origin: true,
                    methods: ["GET", "POST"],
                    allowedHeaders: ["Content-Type"],
                })
            )
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(
                session({
                    secret: await this.config.getSessionSecret(),
                    resave: false,
                    saveUninitialized: true,
                    cookie: {
                        secure: this.config.usesHttps,
                    },
                })
            );
    }
}
