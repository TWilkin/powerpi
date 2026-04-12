from powerpi_common.logger import Logger, LogMixin
from powerpi_common.device import DeviceManager

from .provider import ARPProvider


class ARPProviderFactory(LogMixin):
    '''
    Factory to return the ARPProvider that is available.
    Currently only supports a packet listener, which won't work with VLANs.
    '''

    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        service_provider
    ):
        self._logger = logger
        self.__device_manager = device_manager
        self.__service_provider = service_provider

    def get_arp_service(self) -> ARPProvider | None:
        # first, do we have any presence services?
        from network_controller.sensor.presence import PresenceSensor
        presence = [
            sensor for sensor in self.__device_manager.sensors.values()
            if isinstance(sensor, PresenceSensor)
        ]

        if len(presence) == 0:
            self.log_info(
                'No ARP Reader when no presence sensors are detected'
            )
            return None

        # for now there is only one service
        service: ARPProvider = self.__service_provider.packet_arp_provider()

        return service
