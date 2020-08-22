import schedule
from threading import Thread
import time

from power_starter.devices import DeviceManager


class StatusChecker:

    def schedule(self):
        def run():
            for device in DeviceManager.get():
                if device.pollable:
                    device.poll()
        
        schedule.every(1).minute.do(run)

        run()
    
    def loop_start(self):
        thread = Thread(target=self.__loop, args=())
        thread.daeomn = True
        thread.start()
    
    def __loop(self):
        while True:
            schedule.run_pending()
            time.sleep(1)
