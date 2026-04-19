from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common_test.device.mixin import PollableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase
from pytest_mock import MockerFixture

from network_controller.sensor.presence import PresenceSensor, PresenceStatus
from network_controller.services.arp import HostAddress


class TestPresenceSensor(SensorTestBase, PollableMixinTestBase):

    @pytest.mark.parametrize('prop,expected', [
        ('mac_address', '00:11:22:33:44:55'),
        ('ip_address', '192.168.1.100'),
        ('hostname', 'mydevice.local'),
    ])
    def test_properties(self, subject: PresenceSensor, prop: str, expected: str):
        assert getattr(subject, prop) == expected

    @pytest.mark.asyncio
    async def test_ip_address_from_cache(
        self,
        subject_no_ip: PresenceSensor,
        arp_reader: MagicMock,
    ):
        assert subject_no_ip.ip_address is None

        arp_reader.find.return_value = HostAddress(
            mac_address='00:11:22:33:44:55',
            ip_address='192.168.1.100',
            hostname='mydevice.local',
        )

        await subject_no_ip.poll()

        assert subject_no_ip.ip_address == '192.168.1.100'

    @pytest.mark.asyncio
    async def test_poll_found_in_arp(
        self,
        subject: PresenceSensor,
        arp_reader: MagicMock,
        powerpi_mqtt_producer: MagicMock,
    ):
        arp_reader.find.return_value = HostAddress(
            mac_address='00:11:22:33:44:55',
            ip_address='192.168.1.100',
        )

        await subject.poll()

        powerpi_mqtt_producer.assert_called_once_with(
            'presence/test_presence/status',
            {'state': PresenceStatus.PRESENT},
        )

        # if we call it again it won't publish again
        await subject.poll()

        powerpi_mqtt_producer.assert_called_once()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('is_alive,expected_state', [
        (True, PresenceStatus.PRESENT),
        (False, None),
    ])
    async def test_poll_not_in_arp_ping(
        self,
        subject: PresenceSensor,
        arp_reader: MagicMock,
        mocker: MockerFixture,
        powerpi_mqtt_producer: MagicMock,
        is_alive: bool,
        expected_state: PresenceStatus | None,
    ):
        arp_reader.find.return_value = None

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=is_alive)
        mocker.patch(
            'network_controller.sensor.presence.ping',
            return_value=host,
        )

        await subject.poll()

        if expected_state is not None:
            powerpi_mqtt_producer.assert_called_once_with(
                'presence/test_presence/status',
                {'state': expected_state},
            )
        else:
            powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    async def test_poll_not_in_arp_ping_dead_grace_expired(
        self,
        subject: PresenceSensor,
        arp_reader: MagicMock,
        mocker: MockerFixture,
        powerpi_mqtt_producer: MagicMock,
    ):
        arp_reader.find.return_value = None

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=False)
        mocker.patch(
            'network_controller.sensor.presence.ping',
            return_value=host,
        )
        # absent_delay=10, each poll gap (5s) is less than the delay
        # 1000: timer starts
        # 1005: within grace period, timer must not reset
        # 1011: 11s since timer started, grace period expired
        # 1016: still absent, no duplicate broadcast
        mocker.patch(
            'network_controller.sensor.presence.time',
            side_effect=[1000, 1005, 1011, 1016],
        )

        # polls within the grace period should not trigger absent
        await subject.poll()
        await subject.poll()

        powerpi_mqtt_producer.assert_not_called()

        # poll after the grace period has expired
        await subject.poll()

        powerpi_mqtt_producer.assert_called_once_with(
            'presence/test_presence/status',
            {'state': PresenceStatus.ABSENT},
        )

        # if we call it again it won't publish again
        await subject.poll()

        powerpi_mqtt_producer.assert_called_once()

    @pytest.mark.asyncio
    async def test_poll_absent_then_present(
        self,
        subject: PresenceSensor,
        arp_reader: MagicMock,
        mocker: MockerFixture,
        powerpi_mqtt_producer: MagicMock,
    ):
        arp_reader.find.return_value = None

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=False)
        mocker.patch(
            'network_controller.sensor.presence.ping',
            return_value=host,
        )
        # absent_delay=10, each poll gap (5s) is less than the delay
        # 1000: timer starts
        # 1005: within grace period, timer must not reset
        # 1011: 11s since timer started, grace period expired
        mocker.patch(
            'network_controller.sensor.presence.time',
            side_effect=[1000, 1005, 1011],
        )

        await subject.poll()
        await subject.poll()
        await subject.poll()

        arp_reader.find.return_value = HostAddress(
            mac_address='00:11:22:33:44:55',
        )

        await subject.poll()

        assert powerpi_mqtt_producer.call_count == 2
        powerpi_mqtt_producer.assert_any_call(
            'presence/test_presence/status',
            {'state': PresenceStatus.ABSENT},
        )
        powerpi_mqtt_producer.assert_any_call(
            'presence/test_presence/status',
            {'state': PresenceStatus.PRESENT},
        )

    @pytest.mark.asyncio
    async def test_poll_absent_recovers_via_ping(
        self,
        subject: PresenceSensor,
        arp_reader: MagicMock,
        mocker: MockerFixture,
        powerpi_mqtt_producer: MagicMock,
    ):
        arp_reader.find.return_value = None

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=False)
        mocker.patch(
            'network_controller.sensor.presence.ping',
            return_value=host,
        )
        # absent_delay=10, each poll gap (5s) is less than the delay
        # 1000: timer starts, ping dead
        # 1005: within grace period, ping dead
        # 1011: grace period expired, marked absent
        # 1016: timer should have reset, new grace period starts, ping alive
        mocker.patch(
            'network_controller.sensor.presence.time',
            side_effect=[1000, 1005, 1011, 1016],
        )

        await subject.poll()
        await subject.poll()
        await subject.poll()

        powerpi_mqtt_producer.assert_called_once_with(
            'presence/test_presence/status',
            {'state': PresenceStatus.ABSENT},
        )

        # device now responds to ping
        type(host).is_alive = PropertyMock(return_value=True)

        await subject.poll()

        assert powerpi_mqtt_producer.call_count == 2
        powerpi_mqtt_producer.assert_called_with(
            'presence/test_presence/status',
            {'state': PresenceStatus.PRESENT},
        )

    @pytest.fixture
    def arp_reader(self, mocker: MockerFixture):
        reader = mocker.MagicMock()
        reader.find.return_value = HostAddress()
        return reader

    @pytest.fixture
    def arp_factory(self, mocker: MockerFixture, arp_reader: MagicMock):
        factory = mocker.MagicMock()
        factory.get_arp_service.return_value = arp_reader
        return factory

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        arp_factory,
    ):
        return PresenceSensor(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            arp_provider_factory=arp_factory,
            mac='00:11:22:33:44:55',
            ip='192.168.1.100',
            hostname='mydevice.local',
            absent_delay=10,
            name='test_presence',
            poll_frequency=120,
        )

    @pytest.fixture
    def subject_no_ip(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        arp_factory,
    ):
        return PresenceSensor(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            arp_provider_factory=arp_factory,
            mac='00:11:22:33:44:55',
            hostname='mydevice.local',
            absent_delay=10,
            name='test_presence',
            poll_frequency=120,
        )
