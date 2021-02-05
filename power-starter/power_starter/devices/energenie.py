import time

from energenie import switch_on, switch_off
from pyenergenie import energenie

from . devices import Device, DeviceManager


@Device(device_type='socket')
class SocketDevice(energenie.Devices.ENER002):

    def __init__(self, home_id, config, device_id=0, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), int(device_id)))
        self.__retries = retries
        self.__delay = delay
        self.__use_pyenergenie = use_pyenergenie(config)

    @classmethod
    def initialise(cls):
        if self.__use_pyenergenie:
            energenie.init()

    def turn_on(self):
        if self.__use_pyenergenie:
            self.__run(energenie.Devices.ENER002.turn_on, self)
        else:
            self.__run(switch_on, self.device_id)

    def turn_off(self):
        if self.__use_pyenergenie:
            self.__run(energenie.Devices.ENER002.turn_off, self)
        else:
            self.__run(switch_off, self.device_id)

    def __run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


@Device(device_type='socket_group')
class SocketGroupDevice(energenie.Devices.ENER002):

    def __init__(self, home_id, devices, config, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), 0))
        self.__retries = retries
        self.__delay = delay
        self.__use_pyenergenie = use_pyenergenie(config)

        self.__devices = []
        for device in devices:
            d = DeviceManager.get_device(device)
            self.__devices.append(d)

    @classmethod
    def initialise(cls):
        if self.__use_pyenergenie:
            energenie.init()

    def turn_on(self):
        if self.__use_pyenergenie:
            self.__run(energenie.Devices.ENER002.turn_on, 'on', self)
        else:
            self.__run(switch_on, self.device_id)

    def turn_off(self):
        if self.__use_pyenergenie:
            self.__run(energenie.Devices.ENER002.turn_off, 'off', self)
        else:
            self.__run(switch_off, self.device_id)

    def __run(self, func, status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            device.status = status


def use_pyenergenie(config):
    return config.energenie_type == 'ENER314-RT'
