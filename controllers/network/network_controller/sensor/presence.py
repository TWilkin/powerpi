from dataclasses import dataclass
from enum import StrEnum, unique

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.device.mixin import PollableMixin

from network_controller.services.arp import ARPFactory, ARPReader, HostAddress


@unique
class PresenceStatus(StrEnum):
    PRESENT = 'present'
    ABSENT = 'absent'
    UNKNOWN = 'unknown'


class PresenceSensor(Sensor, PollableMixin):
    '''
    Add supports for detecting a device on the network for user presence detection,
    using ARP tables and ICMP ping.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        arp_factory: ARPFactory,
        mac: str | None = None,
        ip: str | None = None,
        hostname: str | None = None,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)

        self._logger = logger
        self.__factory = arp_factory
        self.__reader: ARPReader | None = None

        self.__host_address = HostAddress(mac, ip, hostname)

        # we cache the values we get from the service, and use them as fallbacks
        self.__cache = HostAddress()

        self.__state = PresenceStatus.UNKNOWN

    @property
    def mac_address(self):
        return self.__get_real_or_cached('mac_address')

    @property
    def ip_address(self):
        return self.__get_real_or_cached('ip_address')

    @property
    def hostname(self):
        return self.__get_real_or_cached('hostname')

    async def poll(self):
        entry = self.__arp_service.find(self)
        if entry is None:
            self.__set_new_state(PresenceStatus.ABSENT)
        else:
            self.__cache = entry
            self.__set_new_state(PresenceStatus.PRESENT)

    def _broadcast(self, state: PresenceStatus):
        topic = f'presence/{self.entity}/status'

        message = {'state': state}

        self._producer(topic, message)

    def __set_new_state(self, state: PresenceStatus):
        if self.__state != state:
            self.__state = state

            self._broadcast(state)

    @property
    def __arp_service(self):
        if self.__reader is None:
            self.__reader = self.__factory.get_arp_service()

        return self.__reader

    def __get_real_or_cached(self, prop: str):
        value = getattr(self.__host_address, prop)
        if value is not None:
            return value

        return getattr(self.__cache, prop)
