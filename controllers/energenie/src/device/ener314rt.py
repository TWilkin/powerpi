import time

from pyenergenie import energenie


energenie.init()


class SocketDevice(energenie.Devices.ENER002):

    def __init__(self, name, home_id, device_id=0, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), int(device_id)))
        self.__name = name
        self.__retries = retries
        self.__delay = delay

    def turn_on(self):
        self.__run(energenie.Devices.ENER002.turn_on, self)

    def turn_off(self):
        self.__run(energenie.Devices.ENER002.turn_off, self)

    def __run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


class SocketGroupDevice(energenie.Devices.ENER002):

    def __init__(self, name, home_id, devices, retries=4, delay=0.5):
        energenie.Devices.ENER002.__init__(self, (int(home_id), 0))
        self.__name = name
        self.__retries = retries
        self.__delay = delay

        self.__devices = []
        for device in devices:
            d = DeviceManager.get_device(device)
            self.__devices.append(d)

    def turn_on(self):
        self.__run(energenie.Devices.ENER002.turn_on, 'on', self)

    def turn_off(self):
        self.__run(energenie.Devices.ENER002.turn_off, 'off', self)

    def __run(self, func, status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            device.status = status
