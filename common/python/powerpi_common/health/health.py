from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from powerpi_common.config import Config
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient


class HealthService(LogMixin):
    '''
    HealthService which will check the health of a controller/Python service periodically so that 
    it can be automatically restarted by the container orchestrator as needed.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler
    ):
        self.__config = config
        self._logger = logger
        self.__mqtt_client = mqtt_client
        self.__scheduler = scheduler

    async def start(self):
        self.log_info('Scheduling health checks')

        # run it now before the schedule
        await self.run()

        interval = IntervalTrigger(seconds=10)

        self.__scheduler.add_job(self.run, trigger=interval)

    async def run(self):
        if self.__mqtt_client.connected:
            self.log_debug('MQTT connected')

            health_file = Path(self.__config.health_check_file)

            health_file.touch(exist_ok=True)
        else:
            self.log_warning('MQTT not connected')
