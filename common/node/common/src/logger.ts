import loggy from "loggy";
import { Service } from "typedi";
import ConfigService from "./config";

@Service()
export default class LoggerService {
  public init(config: ConfigService) {
    this.info(`
__________                         __________.__ 
\\______   \\______  _  __ __________\\______   \\__|
|     ___/  _ \\ \\/ \\/ // __ \\_  __ \\     ___/  |
|    |  (  <_> )     /\\  ___/|  | \\/    |   |  |
|____|   \\____/ \\/\\_/  \\___  >__|  |____|   |__|
                            \\/             
      `);
    this.info(`${config.name} v${config.version}`);
  }

  public info(...args: any[]) {
    loggy.info(...args);
  }

  public warn(...args: any[]) {
    loggy.warn(...args);
  }

  public error(...args: any[]) {
    loggy.error(...args);
  }
}
