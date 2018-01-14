from pyharmony.client import create_and_connect_client
from pyharmony.discovery import discover
from .devices import Device, DeviceManager


@Device(device_type='harmony_hub')
class HarmonyHub(object):

    __hubs = None

    def __init__(self):
        self.__client = None
        self.__config = None
        self.__activities = {}

    def __enter__(self):
        """Support with clause for connect/disconnect."""
        self.__connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Support with clause for connect/disconnect."""
        self.__disconnect()

    def turn_on(self):
        pass

    def turn_off(self):
        self.power_off()

    def start_activity(self, name):
        self.__client.start_activity(self.__activities[name])

    def power_off(self):
        self.__client.power_off()

    def __connect(self):
        # try and find the hub on the local network
        if HarmonyHub.__hubs is None:
            HarmonyHub.__hubs = discover()

        # identify the hub we want
        ip = None
        port = None
        for hub in HarmonyHub.__hubs:
            if hub['host_name'] == self.name or hub['friendlyName'] == self.name:
                ip = hub['ip']
                port = hub['port']

        # check we found it
        if ip is None or port is None:
            raise Exception('Could not find Harmony Hub %s.' % self.name)

        # connect to the hub and load the config
        self.__client = create_and_connect_client(ip, port)
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
            self.status = 'on'

    def turn_off(self):
        with self.__hub:
            self.__hub.power_off()
            self.status = 'off'
