import schedule
import time

from power_starter.devices import DeviceManager
from power_starter.util.logger import Logger


class StatusChecker:

    def schedule(self):
        def run():
            Logger.info('Checking device status')

            for device in DeviceManager.get():
                if device.pollable:
                    Logger.info('Polling %s' % device)
                    device.poll()
                    Logger.info('Polled %s' % device)
        
        schedule.every(1).minute.do(run)

        run()
    
    def loop(self):
        while True:
            schedule.run_pending()
            time.sleep(1)
