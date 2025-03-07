import { LogErrorParameter, LogLevel, LogParameter } from "@powerpi/common";

interface Message {
    level: LogLevel;
    message: string;
}

export class MockLoggerService {
    private readonly messages: Message[];

    constructor() {
        this.messages = [];
    }

    get log() {
        return this.messages;
    }

    debug = (...args: LogParameter[]) => this.append("DEBUG", args);

    info = (...args: LogParameter[]) => this.append("INFO", args);

    warn = (...args: LogParameter[]) => this.append("WARN", args);

    error = (...args: LogErrorParameter[]) => this.append("ERROR", args);

    private append(level: LogLevel, ...args: LogParameter[] | LogErrorParameter[]) {
        this.messages.push({
            level,
            message: args.join(" "),
        });
    }
}
