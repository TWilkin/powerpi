import { LoggerService, MqttService } from "@powerpi/common";
import Container from "./container.js";
import EnergyMonitorArgumentsService from "./services/EnergyMonitorArgumentService.js";
import EnergyMonitorService from "./services/EnergyMonitorService.js";

function start() {
    const args = Container.get(EnergyMonitorArgumentsService);
    if (args.options.daemon) {
        const logger = Container.get(LoggerService);
        logger.info("Running as daemon");
    }

    const mqtt = Container.get(MqttService);
    mqtt.connect();

    const monitor = Container.get(EnergyMonitorService);
    monitor.start();
}

start();
