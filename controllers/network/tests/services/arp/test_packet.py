from asyncio import Event
from collections.abc import Callable
from socket import herror, inet_aton
from unittest.mock import MagicMock, PropertyMock

import pytest
from netifaces import AF_INET
from pytest_mock import MockerFixture

from network_controller.services.arp.packet import PacketARPProvider

MODULE = 'network_controller.services.arp.packet'

SubjectFactory = Callable[..., tuple[PacketARPProvider, Event]]


class _LoopDone(Exception):
    pass


class TestPacketARPProvider:

    def test_table_initially_empty(self, subject: PacketARPProvider):
        assert subject.table == []

    @pytest.mark.asyncio
    async def test_packet_received(self, create_subject: SubjectFactory):
        subject, loop_done = create_subject()

        await subject.start()
        await loop_done.wait()
        await subject.stop()

        assert len(subject.table) == 1

        entry = subject.table[0]
        assert entry.mac_address == 'aa:bb:cc:dd:ee:ff'
        assert entry.ip_address == '192.168.1.100'
        assert entry.hostname == 'myhost.local'

    @pytest.mark.asyncio
    async def test_hostname_resolution_fails(self, create_subject: SubjectFactory):
        subject, loop_done = create_subject(hostname=None)

        await subject.start()
        await loop_done.wait()
        await subject.stop()

        assert len(subject.table) == 1
        assert subject.table[0].hostname is None

    @pytest.mark.asyncio
    async def test_prune_removes_old_entries(
        self,
        create_subject: SubjectFactory,
        mocker: MockerFixture,
    ):
        mocker.patch(f'{MODULE}.time', return_value=2000)

        subject, loop_done = create_subject(arp_cache_expiry=1)

        await subject.start()
        await loop_done.wait()
        await subject.stop()

        assert subject.table == []

    @pytest.mark.asyncio
    async def test_no_suitable_interface(
        self,
        subject: PacketARPProvider,
        mocker: MockerFixture,
    ):
        mocker.patch(f'{MODULE}.interfaces', return_value=['lo', 'docker0'])

        await subject.start()
        await subject.stop()

        assert subject.table == []

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
    ) -> PacketARPProvider:
        type(powerpi_config).arp_cache_expiry = PropertyMock(return_value=60)
        return PacketARPProvider(powerpi_config, powerpi_logger)

    @pytest.fixture(autouse=True)
    def mock_infrastructure(self, mocker: MockerFixture):
        mocker.patch(f'{MODULE}.interfaces', return_value=['eth0'])
        mocker.patch(
            f'{MODULE}.ifaddresses',
            return_value={AF_INET: [{'addr': '192.168.1.1'}]},
        )

        iteration_complete = Event()

        def end_loop(_):
            iteration_complete.set()
            raise _LoopDone()
        mocker.patch(f'{MODULE}.sleep', side_effect=end_loop)

        sniffer = mocker.MagicMock()
        mocker.patch(f'{MODULE}.pcap', return_value=sniffer)

        return sniffer, iteration_complete

    @pytest.fixture
    def create_subject(
        self,
        powerpi_config,
        powerpi_logger,
        mock_infrastructure,
        mocker: MockerFixture,
    ):
        def build(
            arp_cache_expiry: int = 60,
            hostname: str | None = 'myhost.local',
        ) -> tuple[PacketARPProvider, Event]:
            sniffer, iteration_complete = mock_infrastructure

            type(powerpi_config).arp_cache_expiry = PropertyMock(
                return_value=arp_cache_expiry,
            )

            self.__setup_dispatch(sniffer, mocker, hostname=hostname)

            subject = PacketARPProvider(powerpi_config, powerpi_logger)
            return subject, iteration_complete

        return build

    def __setup_dispatch(
        self,
        sniffer: MagicMock,
        mocker: MockerFixture,
        hostname: str | None = 'myhost.local',
    ):
        mock_arp = mocker.MagicMock()
        mock_arp.spa = inet_aton('192.168.1.100')
        mock_arp.sha = bytes([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff])

        mock_eth = mocker.MagicMock()
        mock_eth.data = mock_arp

        mocker.patch(f'{MODULE}.ethernet.Ethernet', return_value=mock_eth)

        if hostname is not None:
            mocker.patch(
                f'{MODULE}.gethostbyaddr',
                return_value=(hostname, [], []),
            )
        else:
            mocker.patch(f'{MODULE}.gethostbyaddr', side_effect=herror())

        def dispatch_handler(__, callback):
            callback(1000, b'raw')
        sniffer.dispatch.side_effect = dispatch_handler
