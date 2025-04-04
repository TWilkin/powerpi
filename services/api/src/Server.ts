import { $log, Configuration, PlatformApplication } from "@tsed/common";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import "reflect-metadata";
import * as controllers from "./controllers/index.js";
import * as protocols from "./protocols/index.js";
import ConfigService from "./services/ConfigService.js";
import * as services from "./services/index.js";

const __dirname = import.meta.dirname;

@Configuration({
    rootDir: __dirname,
    httpPort: 3000,
    httpsPort: false,
    mount: { "/api": [...Object.values(controllers)] },
    imports: [...Object.values(protocols), ...Object.values(services)],
    socketIO: {
        path: "/api/socket.io",
    },
    acceptMimes: ["application/json"],
})
export default class Server {
    constructor(
        private readonly config: ConfigService,
        private readonly app: PlatformApplication,
    ) {}

    public async $beforeRoutesInit() {
        $log.level = this.config.logLevel;

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
                }),
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
                }),
            );
    }
}
