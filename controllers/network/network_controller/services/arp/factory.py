from .arp import ARPReader


class ARPFactory:
    '''
    Factory to return the ARPReader that is available.
    Currently only supports a local ARP listener, which won't with VLANs.
    '''

    def __init__(
        self,
        service_provider
    ):
        self.__service_provider = service_provider

    def get_arp_service(self) -> ARPReader:
        # for now there is only one service
        # we should return None if there are no presence sensors
        service: ARPReader = self.__service_provider.local_arp_listener()

        return service
