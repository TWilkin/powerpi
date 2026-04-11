from abc import abstractmethod
from dataclasses import dataclass

from powerpi_common.logger import LogMixin


@dataclass
class HostAddress:
    mac_address: str | None = None
    ip_address: str | None = None
    hostname: str | None = None


class ARPReader(LogMixin):
    '''
    Abstract class defining the operations an ARP table reading service will provide.
    '''

    @property
    @abstractmethod
    def table(self) -> list[HostAddress]:
        '''
        Return the ARP table.
        '''
        raise NotImplementedError

    async def start(self):
        '''
        If the listener needs to do anything to start processing implement this method.
        '''

    async def stop(self):
        '''
        If the listener needs to do anything to stop processing implement this method.
        '''

    def find(self, address: HostAddress) -> HostAddress | None:
        props = ['mac_address', 'ip_address', 'hostname']

        for prop in props:
            address_value = getattr(address, prop)
            if address_value is None:
                continue

            for entry in self.table:
                if address_value == getattr(entry, prop):
                    return entry

        return None
