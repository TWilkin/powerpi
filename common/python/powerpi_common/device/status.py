from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from typing import List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.util import ismixin
from .manager import DeviceManager
from .mixin.pollable import PollableMixin


class DeviceStatusChecker(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        device_manager: DeviceManager,
        scheduler: AsyncIOScheduler
    ):
        self.__logger = logger
        self.__device_manager = device_manager

        self.__scheduler = scheduler

        # no more frequently than 10s
        self.__poll_frequency = max(config.poll_frequency, 10)
    
    @property
    def devices(self) -> List[PollableMixin]:
        return list(filter(
            lambda device: ismixin(device, PollableMixin),
            [device for device in self.__device_manager.devices.values()]
        ))

    def start(self):
        # only schedule if there are pollable devices
        if len(self.devices) > 0:
            self.__logger.info(f'Polling for device state changes every {self.__poll_frequency} seconds for {len(self.devices)} device(s)')

            interval = IntervalTrigger(seconds=self.__poll_frequency)
            self.__scheduler.add_job(self._run, trigger=interval)
            self.__scheduler.start()

    def stop(self):
        if self.__scheduler.running:
            self.__logger.info('Stopping device state change polling')
            self.__scheduler.shutdown()

    async def _run(self):
        self.__logger.info('Checking devices state')

        for device in self.devices:
            try:
                await device.poll()
            except Exception as e:
                self.__logger.exception(e)
