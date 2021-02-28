class DeviceManager(object):
    __instance = None

    def __init__(self):
        self.__devices = {}

    @property
    def devices(self):
        return self.__devices

    @devices.setter
    def devices(self, value):
        self.__devices = value

    def get_device(self, name):
        if self.__devices[name]:
            return self.__devices[name]

        raise Exception('Cannot find device "{name}"'.format(name=name))

    @classmethod
    def instance(cls):
        if cls.__instance is None:
            cls.__instance = DeviceManager()

        return cls.__instance
