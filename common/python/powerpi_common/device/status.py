import atexit

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .manager import DeviceManager


class DeviceStatusChecker(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        device_manager: DeviceManager
    ):
        self.__logger = logger
        self.__device_manager = device_manager

        self.__scheduler = AsyncIOScheduler()

        # no more frequently than 10s
        self.__poll_frequency = max(config.poll_frequency, 10)

    def start(self):
        self.__logger.info(f'Polling for device state changes every {self.__poll_frequency} seconds')

        atexit.register(self.stop)

        interval = IntervalTrigger(seconds=self.__poll_frequency)
        self.__scheduler.add_job(self.__run, trigger=interval)
        self.__scheduler.start()

    def stop(self):
        self.__logger.info('Stopping device state change polling')
        self.__scheduler.shutdown()

    async def __run(self):
        self.__logger.info('Checking devices state')

        for device in self.__device_manager.devices.values():
            try:
                await device.poll()
            except Exception as e:
                self.__logger.exception(e)
