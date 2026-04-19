from dataclasses import dataclass
from time import time

from powerpi_common.mqtt import MQTTTopic
from powerpi_common.sensor import Sensor
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.sensor import PresenceStatus

from network_controller.services.arp import ARPProviderFactory, ARPProvider, HostAddress
from network_controller.util import ping


@dataclass
class GracePeriod:
    delay: int
    timer: int = 0


class PresenceSensor(Sensor, PollableMixin):
    '''
    Add supports for detecting a device on the network for user presence detection,
    using ARP tables and ICMP ping.
    '''

    def __init__(
        self,
        arp_provider_factory: ARPProviderFactory,
        mac: str | None = None,
        ip: str | None = None,
        hostname: str | None = None,
        absent_delay: int = 3 * 60,
        **kwargs
    ):
        # pylint: disable=too-many-arguments,too-many-positional-arguments
        Sensor.__init__(self, **kwargs)
        PollableMixin.__init__(self, **kwargs)

        self.__factory = arp_provider_factory
        self.__provider: ARPProvider | None = None

        self.__host_address = HostAddress(mac, ip, hostname)

        # we cache the values we get from the service, and use them as fallbacks
        self.__cache = HostAddress()

        self.__grace_period = GracePeriod(absent_delay)

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
        entry = self.__arp_provider.find(self)
        if entry is None:
            # apply the grace period before marking the device as absent
            await self.__check_grace_period()
        else:
            self.log_debug('Device present in ARP cache')

            # update the cache of MAC, IP and hostname
            self.__cache = entry

            self.__set_new_state(PresenceStatus.PRESENT)

    async def __check_grace_period(self):
        # first has the period already expired?
        now = int(time())
        expiry = now - self.__grace_period.delay

        if self.__grace_period.timer != 0 and self.__grace_period.timer < expiry:
            # it has expired
            self.log_debug('Device absent after grace period')

            self.__set_new_state(PresenceStatus.ABSENT)

            return

        # start the timer, but only if it's not already started
        if self.__grace_period.timer == 0:
            self.__grace_period.timer = now

        # try to ping
        is_alive = await self.__is_alive()
        if is_alive:
            # it is actually present
            self.log_debug('Device present after ping')

            self.__set_new_state(PresenceStatus.PRESENT)

    def __broadcast(self, state: PresenceStatus):
        topic = f'{MQTTTopic.PRESENCE}/{self.entity}/status'

        message = {'state': state}

        self._producer(topic, message)

    def __set_new_state(self, state: PresenceStatus):
        # reset the grace period timer as the device state is confirmed
        # if it disappears again we want to allow the grace period again
        self.__grace_period.timer = 0

        if self.__state != state:
            self.__state = state

            self.__broadcast(state)

    @property
    def __arp_provider(self):
        if self.__provider is None:
            self.__provider = self.__factory.get_arp_service()

        return self.__provider

    def __get_real_or_cached(self, prop: str):
        value = getattr(self.__host_address, prop)
        if value is not None:
            return value

        return getattr(self.__cache, prop)

    async def __is_alive(self):
        network_address = self.ip_address if self.ip_address else self.hostname

        result = await ping(network_address, 1)

        return result.is_alive
