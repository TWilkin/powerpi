import time

from pyenergenie import energenie

from . devices import Device, DeviceManager


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

    def turn_off(self):
        self.__run(energenie.Devices.ENER002.turn_off, self)

    def __run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


@Device(device_type='socket_group')
class SocketGroupDevice(energenie.Devices.ENER002):

    def __init__(self, home_id, devices, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), 0))
        self.__retries = retries
        self.__delay = delay

        self.__devices = []
        for device in devices:
            d = DeviceManager.get_device(device)
            self.__devices.append(d)

    @classmethod
    def initialise(cls):
        energenie.init()

    def turn_on(self):
        self.__run(True)

    def turn_off(self):
        self.__run(False)

    def __run(self, on):
        payload = {
            "house_address": self.device_id[0],
            "device_index": self.device_id[1],
            "on": on
        }

        for i in range(0, self.__retries):
            self.send_message(payload)
            time.sleep(self.__delay)

        for device in self.__devices:
            device.status = self.status
