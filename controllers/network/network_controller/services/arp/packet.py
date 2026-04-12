from asyncio import ensure_future, sleep, Future
from dataclasses import dataclass
from socket import inet_ntoa, gethostbyaddr, herror
from time import time
from threading import RLock

from dpkt import ethernet
from netifaces import interfaces, ifaddresses, AF_INET
from pcap import pcap
from powerpi_common.logger import Logger

from network_controller.config import NetworkConfig
from network_controller.services.arp import ARPProvider, HostAddress


@dataclass
class ARPEntry(HostAddress):
    timestamp: int = 0


class PacketARPProvider(ARPProvider):
    '''
    Packet ARP provider which listens for ARP events on the local network.
    Will only work if the devices are on the same VLAN as the cluster nodes running the service.
    '''

    def __init__(
        self,
        config: NetworkConfig,
        logger: Logger
    ):
        self.__config = config
        self._logger = logger

        self.__running = False
        self.__future: Future | None

        self.__table: list[ARPEntry] = []
        self.__lock = RLock()

    async def start(self):
        self.__running = True

        self.__future = ensure_future(self.__sniff())

    async def stop(self):
        self.__running = False
        await self.__future

    @property
    def table(self):
        with self.__lock:
            return self.__table

    async def __sniff(self):
        self.log_info(
            'Sniffing ARP traffic, cache expiry after %ds',
            self.__config.arp_cache_expiry
        )

        try:
            interface = self.__get_interface()
            self.log_info('Using interface %s', interface)

            sniffer = pcap(interface, timeout_ms=1000)
            sniffer.setfilter('arp')
            sniffer.setnonblock()

            counter = 0

            while self.__running:
                counter += 1

                sniffer.dispatch(-1, self.__handle_packet)

                # prune anything that hasn't been seen in a while
                if counter >= self.__config.arp_cache_expiry:
                    counter = 0

                    self.__prune()

                await sleep(1)
        except Exception as ex:
            self.log_error(ex)

    def __handle_packet(self, timestamp: int, raw):
        eth = ethernet.Ethernet(raw)
        arp = eth.data
        src_ip = inet_ntoa(arp.spa)
        src_mac = ':'.join('%02x' % bit for bit in arp.sha)

        host_address = HostAddress(src_mac, src_ip)
        self.__set_hostname(host_address)
        self.log_debug('Received ARP packet %s', host_address)

        with self.__lock:
            entry = self.find(host_address)
            if entry is None:
                self.__table.append(ARPEntry(
                    host_address.mac_address,
                    host_address.ip_address,
                    host_address.hostname,
                    timestamp
                ))
            else:
                entry.mac_address = src_mac
                entry.ip_address = src_ip
                entry.hostname = host_address.hostname

    def __get_interface(self):
        for iface in interfaces():
            if iface.startswith(('lo', 'docker', 'br-', 'veth', 'virbr', 'vxlan', 'tun', 'tap')):
                continue

            if AF_INET in ifaddresses(iface):
                return iface

        raise RuntimeError('No suitable network interface found')

    def __set_hostname(self, host_address: HostAddress):
        try:
            result = gethostbyaddr(host_address.ip_address)

            host_address.hostname = result[0]
        except herror:
            host_address.hostname = None

    def __prune(self):
        now = int(time())
        expiry = now - self.__config.arp_cache_expiry

        with self.__lock:
            count = len(self.__table)

            self.__table = [
                entry for entry in self.__table
                if entry.timestamp > expiry
            ]

            new_count = len(self.__table)
            if new_count != count:
                self.log_debug(
                    'Removed %d expired ARP records',
                    count - new_count
                )
