from powerpi_common.logger import Logger, LogMixin
from powerpi_common.device import DeviceManager

from .arp import ARPReader


class ARPFactory(LogMixin):
    '''
    Factory to return the ARPReader that is available.
    Currently only supports a local ARP listener, which won't with VLANs.
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

    def get_arp_service(self) -> ARPReader | None:
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
        service: ARPReader = self.__service_provider.local_arp_listener()

        return service
