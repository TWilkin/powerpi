import time

from energenie import switch_on, switch_off


class SocketDevice(object):

    def __init__(self, name, home_id=0, device_id=0, retries=4, delay=0.5):
        self.__name = name
        self.__device_id = int(device_id)
        self.__retries = retries
        self.__delay = delay

    def turn_on(self):
        self.__run(switch_on, self.__device_id)

    def turn_off(self):
        self.__run(switch_off, self.__device_id)

    def __run(self, func, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


class SocketGroupDevice(object):

    def __init__(self, name, devices, home_id=None, retries=4, delay=0.5):
        self.__name = name
        self.__retries = retries
        self.__delay = delay

        self.__devices = []
        for device in devices:
            d = DeviceManager.get_device(device)
            self.__devices.append(d)

    def turn_on(self):
        self.__run(switch_on, 'on')

    def turn_off(self):
        self.__run(switch_off, 'off')

    def __run(self, func, status, *params):
        for i in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            device.status = status
