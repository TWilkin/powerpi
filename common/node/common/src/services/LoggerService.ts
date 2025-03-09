import dateFormat from "dateformat";
import logger from "loglevel";
import { Service } from "typedi";
import { ConfigService } from "./ConfigService.js";

export type LogParameter = string | number | Date;
export type LogErrorParameter = LogParameter | Error | unknown;

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

@Service()
export class LoggerService {
    private static readonly timestampFormat = "yyyy-mm-dd HH:MM:ss";

    public constructor(private readonly config: ConfigService) {
        logger.setLevel(config.logLevel);

        this.info(`
__________                         __________.__ 
\\______   \\______  _  __ __________\\______   \\__|
|     ___/  _ \\ \\/ \\/ // __ \\_  __ \\     ___/  |
|    |  (  <_> )     /\\  ___/|  | \\/    |   |  |
|____|   \\____/ \\/\\_/  \\___  >__|  |____|   |__|
                            \\/             
      `);
        this.info(`${this.config.service} v${this.config.version}`);
    }

    public debug(...args: LogParameter[]) {
        // eslint-disable-next-line testing-library/no-debugging-utils
        logger.debug(this.label("DEBUG"), ...args);
    }

    public info(...args: LogParameter[]) {
        logger.info(this.label("INFO"), ...args);
    }

    public warn(...args: LogParameter[]) {
        logger.warn(this.label("WARN"), ...args);
    }

    public error(...args: LogErrorParameter[]) {
        logger.error(this.label("ERROR"), ...args);
    }

    private label(level: LogLevel) {
        return `[${dateFormat(new Date(), LoggerService.timestampFormat)} ${level}]`;
    }
}
