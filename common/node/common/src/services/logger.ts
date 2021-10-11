import dateFormat from "dateformat";
import logger from "loglevel";
import { Service } from "typedi";
import { ConfigService } from "./config";

@Service()
export class LoggerService {
  private static timestampFormat = "yyyy-mm-dd HH:MM:ss";

  public constructor(private config: ConfigService) {
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

  public debug(...args: any[]) {
    logger.debug(this.label("DEBUG"), ...args);
  }

  public info(...args: any[]) {
    logger.info(this.label("INFO"), ...args);
  }

  public warn(...args: any[]) {
    logger.warn(this.label("WARN"), ...args);
  }

  public error(...args: any[]) {
    logger.error(this.label("ERROR"), ...args);
  }

  private label(level: string) {
    return `[${dateFormat(
      new Date(),
      LoggerService.timestampFormat
    )} ${level}]`;
  }
}
