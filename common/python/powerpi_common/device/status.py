import atexit
import schedule
import time

from threading import Thread

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

        self.__running = False

        # no more frequently than 10s
        self.__poll_frequency = max(config.poll_frequency, 10)

    def start(self):
        self.__running = True

        atexit.register(self.stop)

        thread = Thread(target=self.__loop, args=())
        thread.daemon = True
        thread.start()

    def stop(self):
        self.__logger.info('Stopping device state change polling')
        self.__running = False

    def __schedule(self):
        self.__logger.info(f'Polling for device state changes every {self.__poll_frequency} seconds')

        schedule.every(self.__poll_frequency).seconds.do(self.__run)

    def __run(self):
        self.__logger.info('Checking devices state')
        for _, device in self.__device_manager.devices.items():
            try:
                device.poll()
            except Exception as e:
                self.__logger.exception(e)

    def __loop(self):
        # wait before starting the scheduler
        time.sleep(self.__poll_frequency)

        # start the scheduler
        self.__schedule()

        # calculate a reasonable sleep interval
        interval = max(int(self.__poll_frequency / 10), 1)

        while self.__running:
            schedule.run_pending()
            time.sleep(interval)
