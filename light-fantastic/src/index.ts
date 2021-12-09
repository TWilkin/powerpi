import { PowerPiService } from "@powerpi/common";
import Container from "./container";
import ScheduleExecutorService from "./services/executor";

function start() {
    const executor = Container.get(ScheduleExecutorService);
    executor.start();
}

const service = Container.get(PowerPiService);
service.start(start);
