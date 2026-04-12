from asyncio import ensure_future, sleep, Future
from dataclasses import dataclass
from dpkt import ethernet
from netifaces import interfaces, ifaddresses, AF_INET
from pcap import pcap
from socket import inet_ntoa
from time import time
from threading import RLock

from powerpi_common.logger import Logger

from .arp import ARPReader, HostAddress


@dataclass
class ARPEntry(HostAddress):
    timestamp: int = 0


class LocalARPListener(ARPReader):
    '''
    Local ARP listener which listens for ARP events on the local network.
    Will only work if the devices are on the same VLAN as the cluster nodes running the service.
    '''

    def __init__(
        self,
        logger: Logger
    ):
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
        self.log_info('Sniffing ARP traffic')

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

                # every 120s we prune anything too old
                if counter >= 120:
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

    def __get_interface(self):
        for iface in interfaces():
            if iface.startswith(('lo', 'docker', 'br-', 'veth', 'virbr', 'vxlan', 'tun', 'tap')):
                continue

            if AF_INET in ifaddresses(iface):
                return iface

        raise RuntimeError('No suitable network interface found')

    def __prune(self):
        now = int(time())
        expiry = now - 120

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
