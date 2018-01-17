from .devices import Device
from pyenergenie import energenie

import time


@Device(device_type='socket')
class SocketDevice(energenie.Devices.ENER002):

    def __init__(self, home_id, device_id=0, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), int(device_id)))
        self.__retries = retries
        self.__delay = delay

    @classmethod
    def initialise(cls):
        energenie.init()

    def turn_on(self):
        self.__run(energenie.Devices.ENER002.turn_on, self)
        self.status = 'on'

    def turn_off(self):
        self.__run(energenie.Devices.ENER002.turn_off, self)
        self.status = 'off'

    def __run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)
