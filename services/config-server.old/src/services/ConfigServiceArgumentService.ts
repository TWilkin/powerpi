import { parse } from "ts-command-line-args";
import { Service } from "typedi";
import ConfigServiceArguments from "../models/ConfigServiceArguments.js";
import ConfigService from "./ConfigService.js";

@Service()
export default class ConfigServiceArgumentService {
    private readonly _options: ConfigServiceArguments;

    constructor(private readonly config: ConfigService) {
        this._options = this.execute();
    }

    public get options(): ConfigServiceArguments {
        return this._options;
    }

    private execute() {
        return parse<ConfigServiceArguments>(
            {
                daemon: {
                    type: Boolean,
                    alias: "d",
                    optional: true,
                    defaultValue: false,
                    description: "Whether to run this service as a daemon or one-off",
                },
                help: {
                    type: Boolean,
                    alias: "?",
                    optional: true,
                    description: "Print this usage guide",
                },
            },
            {
                helpArg: "help",
                headerContentSections: [
                    {
                        header: `${this.config.service} v${this.config.version}`,
                    },
                ],
            },
        );
    }
}
