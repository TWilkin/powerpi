class SocketDevice(object):

    def __init__(self, name, home_id=0, device_id=0, retries=4, delay=0.5):
        pass

    def turn_on(self):
        pass

    def turn_off(self):
        pass


class SocketGroupDevice(SocketDevice):

    def __init__(self, name, devices, home_id=None, retries=4, delay=0.5):
        SocketDevice.__init__(home_id, 0, retries, delay)
