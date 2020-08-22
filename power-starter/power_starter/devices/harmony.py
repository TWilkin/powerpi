import pyharmony
from pyharmony.client import create_and_connect_client

from . devices import Device, DeviceManager, DeviceNotFoundException


@Device(device_type='harmony_hub')
class HarmonyHubDevice(object):

    __hubs = None

    def __init__(self, ip=None, hostname=None, port=5222):
        self.__client = None
        self.__config = None
        self.__activities = {}
        self.__address = hostname if hostname is not None else ip
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
    
    def poll(self):
        with self:
            activity = self.__client.get_current_activity()

            # update the state of the activities
            for name, activity_id in self.__activities.items():
                self.__update_activity(name, 'on' if activity == activity_id else 'off')

            return 'off' if activity == -1 else 'on'

    def turn_on(self):
        pass

    def turn_off(self):
        with self:
            self.power_off()

    def start_activity(self, name):
        self.__client.start_activity(self.__activities[name])
        self.__update_activity(name, 'on')

    def power_off(self):
        self.__client.power_off()

        # now set all activities as off
        for name, _ in self.__activities.items():
            self.__update_activity(name, 'off')

    def __connect(self):
        # connect to the hub and load the config
        self.__client = create_and_connect_client(self.__address, self.__port)
        if self.__client:
            self.__config = self.__client.get_config()

            # extract the activities from the config
            for activity in self.__config['activity']:
                self.__activities[activity['label']] = int(activity['id'])
        else:
            raise DeviceNotFoundException('Harmony Hub', self.name)

    def __disconnect(self):
        if self.__client:
            self.__client.disconnect()
    
    def __update_activity(self, name, status):
        device = DeviceManager.get_device(name, device_cls=HarmonyActivityDevice)
        if device is not None:
            device.status = status


@Device(device_type='harmony_activity')
class HarmonyActivityDevice(object):

    def __init__(self, hub):
        self.__hub = DeviceManager.get_device(hub, device_cls=HarmonyHubDevice)

    def turn_on(self):
        with self.__hub:
            self.__hub.start_activity(self.name)

    def turn_off(self):
        with self.__hub:
            self.__hub.power_off()
