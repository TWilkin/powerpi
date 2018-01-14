from .devices import Device


@Device(device_type='socket')
class SocketDevice(object):

    def __init__(self, id):
        self.__id = id


@Device(device_type='socket_gang')
class SocketGangDevice(object):

    def __init__(self, id, socket):
        self.__id = id
        self.__socket = socket
