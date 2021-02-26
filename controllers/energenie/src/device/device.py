class SocketDevice(object):

    def __init__(self, logger, name, home_id=0, device_id=0, retries=4, delay=0.5):
        self.__logger = logger
        self.__name = name

    def turn_on(self):
        self.__logger.info('Turning on socket "{name}"'.format(name=self.__name))

    def turn_off(self):
        self.__logger.info('Turning off socket "{name}"'.format(name=self.__name))


class SocketGroupDevice(SocketDevice):

    def __init__(self, logger, name, devices, home_id=None, retries=4, delay=0.5):
        self.__logger = logger
        self.__name = name
    
    def turn_on(self):
        self.__logger.info('Turning on socket group "{name}"'.format(name=self.__name))

    def turn_off(self):
        self.__logger.info('Turning off socket group "{name}"'.format(name=self.__name))
