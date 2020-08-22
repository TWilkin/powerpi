import schedule
from threading import Thread
import time

from power_starter.devices import DeviceManager
from power_starter.util.logger import Logger


class StatusChecker:

    def __init__(self, config):
        self.__config = config

    def schedule(self):
        def run():
            for device in DeviceManager.get():
                if device.pollable:
                    device.poll()
        
        Logger.info('Polling for device state changes every {:d} minutes'.format(self.__config.poll_frequency))
        schedule.every(self.__config.poll_frequency).minutes.do(run)

        run()
    
    def loop_start(self):
        thread = Thread(target=self.__loop, args=())
        thread.daeomn = True
        thread.start()
    
    def __loop(self):
        while True:
            schedule.run_pending()
            time.sleep(1)
