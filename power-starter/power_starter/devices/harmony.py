import pyharmony
from pyharmony.client import create_and_connect_client
from pyharmony.discovery import discover

from . devices import Device, DeviceManager, DeviceNotFoundException


@Device(device_type='harmony_hub')
class HarmonyHub(object):

    __hubs = None

    def __init__(self, ip=None, port=5222):
        self.__client = None
        self.__config = None
        self.__activities = {}
        self.__ip = ip
        self.__port = port

    def __enter__(self):
        """Support with clause for connect/disconnect."""
        self.__connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Support with clause for connect/disconnect."""
        self.__disconnect()

    @property
    def loggers(self):
        return [pyharmony.discovery.__name__, pyharmony.client.__name__]

    def turn_on(self):
        pass

    def turn_off(self):
        with self:
            self.power_off()

    def start_activity(self, name):
        self.__client.start_activity(self.__activities[name])

    def power_off(self):
        self.__client.power_off()

        # now set all activities as off
        for name, _ in self.__activities.items():
            device = DeviceManager.get_device(name)
            if device is not None:
                device.status = 'off'

    def __connect(self):
        # scan for the address if we don't already have it
        if self.__ip is None or self.__port is None:
            # try and find the hub on the local network
            if HarmonyHub.__hubs is None:
                HarmonyHub.__hubs = discover()

            # identify the hub we want
            self.__ip = None
            self.__port = None
            for hub in HarmonyHub.__hubs:
                if hub['host_name'] == self.name or hub['friendlyName'] == self.name:
                    self.__ip = hub['ip']
                    self.__port = hub['port']

        # check we found it
        if self.__ip is None or self.__port is None:
            raise DeviceNotFoundException('Harmony Hub', self.name)

        # connect to the hub and load the config
        self.__client = create_and_connect_client(self.__ip, self.__port)
        self.__config = self.__client.get_config()

        # extract the activities from the config
        for activity in self.__config['activity']:
            self.__activities[activity['label']] = activity['id']

    def __disconnect(self):
        self.__client.disconnect()


@Device(device_type='harmony_activity')
class HarmonyDevice(object):

    def __init__(self, hub):
        self.__hub = DeviceManager.get_device(hub, device_cls=HarmonyHub)

    def turn_on(self):
        with self.__hub:
            self.__hub.start_activity(self.name)

    def turn_off(self):
        with self.__hub:
            self.__hub.power_off()
