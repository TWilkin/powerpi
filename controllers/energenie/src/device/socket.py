from common.config import Config
from common.device import Device


logger = Config.instance().logger()


class SocketDevice(Device):

    def __init__(self, name, home_id=0, device_id=0, retries=4, delay=0.5):
        Device.__init__(self, name)

    def turn_on(self):
        logger.info('Turning on socket "{name}"'.format(name=self._name))

    def turn_off(self):
        logger.info('Turning off socket "{name}"'.format(name=self._name))
    
    def _run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


class SocketGroupDevice(Device):

    def __init__(self, name, devices, home_id=None, retries=4, delay=0.5):
        Device.__init__(self, name)
    
    def turn_on(self):
        logger.info('Turning on socket group "{name}"'.format(name=self._name))

    def turn_off(self):
        logger.info('Turning off socket group "{name}"'.format(name=self._name))
    
    def __run(self, func, status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            device.status = status
