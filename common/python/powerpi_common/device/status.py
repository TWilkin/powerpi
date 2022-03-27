from typing import Dict, List

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from powerpi_common.logger import Logger
from powerpi_common.util import ismixin
from .manager import DeviceManager
from .mixin.pollable import PollableMixin


class DeviceStatusChecker:
    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        scheduler: AsyncIOScheduler
    ):
        self.__logger = logger
        self.__device_manager = device_manager
        self.__scheduler = scheduler

    def start(self):
        # create a list of pollable devices/sensors
        devices: List[PollableMixin] = list(filter(
            lambda device:
                ismixin(device, PollableMixin)
                and device.polling_enabled,
            list(self.__device_manager.devices_and_sensors.values())
        ))

        # only schedule if there are pollable devices
        if len(devices) > 0:
            groups: Dict[int, List[PollableMixin]] = {}

            # group them by poll frequency
            for device in devices:
                if device.poll_frequency not in groups:
                    groups[device.poll_frequency] = []

                groups[device.poll_frequency].append(device)

            for poll_frequency, devices in groups.items():
                ScheduledDeviceGroup(
                    self.__logger, self.__scheduler, poll_frequency, devices
                )

            self.__scheduler.start()

    def stop(self):
        if self.__scheduler.running:
            self.__logger.info('Stopping device state change polling')
            self.__scheduler.shutdown()


class ScheduledDeviceGroup:
    def __init__(
        self,
        logger: Logger,
        scheduler: AsyncIOScheduler,
        poll_frequency: int,
        devices: List[PollableMixin]
    ):
        self.__logger = logger
        self.__scheduler = scheduler

        self.__poll_frequency = poll_frequency
        self.__devices = devices

        self.__logger.info(
            f'Polling {len(self.__devices)} device(s)/sensor(s)'
            + f' every {poll_frequency} seconds'
        )

        interval = IntervalTrigger(seconds=poll_frequency)
        self.__scheduler.add_job(self.run, trigger=interval)

    @property
    def poll_frequency(self):
        return self.__poll_frequency

    @property
    def devices(self):
        return self.__devices

    async def run(self):
        # pylint: disable=broad-except
        self.__logger.info('Checking device(s)/sensor(s) state')

        for device in self.__devices:
            try:
                await device.poll()
            except Exception as ex:
                self.__logger.exception(ex)
