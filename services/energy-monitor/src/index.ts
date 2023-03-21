import { LoggerService, MqttService } from "@powerpi/common";
import Container from "./container";
import EnergyMonitorArgumentsService from "./services/EnergyMonitorArgumentService";
import EnergyMonitorService from "./services/monitor";

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
