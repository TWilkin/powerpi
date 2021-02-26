import time

from common.config import Config
from common.device import Device
from .manager import DeviceManager


logger = Config.instance().logger()


class SocketDevice(Device):

    def __init__(self, name, home_id=0, device_id=0, retries=4, delay=0.5):
        Device.__init__(self, name)
        self.__retries = retries
        self.__delay = delay

    @Device.status.setter
    def status(self, value):
        Device.status = value
        logger.info('Socket "{name}" now has status {status}'.format(name=self._name, status=Device.status))

    def turn_on(self):
        logger.info('Turning on socket "{name}"'.format(name=self._name))

    def turn_off(self):
        logger.info('Turning off socket "{name}"'.format(name=self._name))
    
    def _run(self, func, new_status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)
        
        self.status = new_status


class SocketGroupDevice(Device):

    def __init__(self, name, devices, home_id=None, retries=4, delay=0.5):
        Device.__init__(self, name)
        self.__devices = devices
        self.__retries = retries
        self.__delay = delay
    
    @Device.status.setter
    def status(self, value):
        Device.status = value
        logger.info('Socket group "{name}" now has status {status}'.format(name=self._name, status=Device.status))
    
    def turn_on(self):
        logger.info('Turning on socket group "{name}"'.format(name=self._name))

    def turn_off(self):
        logger.info('Turning off socket group "{name}"'.format(name=self._name))

    def _run(self, func, new_status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            DeviceManager.instance().get_device(device).status = new_status
        
        self.status = new_status
