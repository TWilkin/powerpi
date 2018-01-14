from pyharmony.client import create_and_connect_client
from pyharmony.discovery import discover
from .devices import Device


class HarmonyHub(object):

    __hubs = None

    def __init__(self):
        self.__client = None
        self.__config = None
        self.__activities = {}

    def connect(self, name):
        # try and find the hub on the local network
        if HarmonyHub.__hubs is None:
            HarmonyHub.__hubs = discover()

        # identify the hub we want
        ip = None
        port = None
        for hub in HarmonyHub.__hubs:
            if hub['host_name'] == name or hub['friendlyName'] == name:
                ip = hub['ip']
                port = hub['port']

        # check we found it
        if ip is None or port is None:
            raise Exception('Could not find Harmony Hub %s.' % name)

        self.__client = create_and_connect_client(ip, port)
        self.__config = self.__client.get_config()

        # extract the activities from the config
        for activity in self.__config['activity']:
            self.__activities[activity['label']] = activity['id']

    def disconnect(self):
        self.__client.disconnect()

    def start_activity(self, name):
        self.__client.start_activity(self.__activities[name])

    def power_off(self):
        self.__client.power_off()


class HarmonyDevice(Device):

    def __init__(self, hub, name):
        self.__hub = hub
        self.__name = name

    def turn_on(self):
        self.__hub.start_activity(self.__name)

    def turn_off(self):
        self.__hub.power_off()
