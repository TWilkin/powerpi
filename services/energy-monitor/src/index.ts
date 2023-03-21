import { MqttService } from "@powerpi/common";
import { parse } from "ts-command-line-args";
import Container from "./container";
import EnergyMonitorArguments from "./models/EnergyMonitorArguments";
import ConfigService from "./services/config";
import EnergyMonitorService from "./services/monitor";

function start() {
    const config = Container.get(ConfigService);

    const args = parse<EnergyMonitorArguments>(
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
                    header: `${config.service} v${config.version}`,
                },
            ],
        }
    );

    const mqtt = Container.get(MqttService);
    mqtt.connect();

    const monitor = Container.get(EnergyMonitorService);
    monitor.start();
}

start();
