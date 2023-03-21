import { parse } from "ts-command-line-args";
import { Service } from "typedi";
import EnergyMonitorArguments from "../models/EnergyMonitorArguments";
import ConfigService from "./ConfigService";

@Service()
export default class EnergyMonitorArgumentsService {
    private readonly _options: EnergyMonitorArguments;

    constructor(private readonly config: ConfigService) {
        this._options = this.execute();
    }

    public get options(): EnergyMonitorArguments {
        return this._options;
    }

    private execute() {
        return parse<EnergyMonitorArguments>(
            {
                daemon: {
                    type: Boolean,
                    alias: "d",
                    optional: true,
                    defaultValue: false,
                    description: "Whether to run this service as a daemon or one-off",
                },
                history: {
                    type: Number,
                    alias: "h",
                    optional: true,
                    defaultValue: 13 * 30,
                    description: "How many days to get usage for (default: 13 months)",
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
            }
        );
    }
}
