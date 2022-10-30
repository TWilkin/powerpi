from asyncio import Future
from typing import Union
from unittest.mock import PropertyMock

from node_controller.device.local_node import LocalNodeDevice
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (InitialisableMixinTestBase,
                                              PollableMixinTestBase)
from powerpi_common_test.mqtt.mqtt import mock_producer
from powerpi_common_test.sensor.mixin import BatteryMixinTestBase
from pytest_mock import MockerFixture


class TestLocalNode(DeviceTestBase, InitialisableMixinTestBase, PollableMixinTestBase, BatteryMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.service_provider = mocker.Mock()
        self.shutdown = mocker.Mock()

        self.pijuice_interface = mocker.Mock()
        self.service_provider.pijuice_interface = lambda **_: self.pijuice_interface

        return LocalNodeDevice(
            self.config,
            self.logger,
            self.mqtt_client,
            self.service_provider,
            self.shutdown,
            getattr(self, 'pijuice', None),
            name='local',
            poll_frequency=60
        )

    async def test_deinitialise_set_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.deinitialise()

        assert subject.state == DeviceStatus.OFF

    async def test_poll_set_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN
        assert subject.has_pijuice is False

        await subject.poll()

        assert subject.state == DeviceStatus.ON

    async def test_poll_with_pijuice(self, mocker: MockerFixture):
        def set_pijuice():
            self.publish = mock_producer(mocker, self.mqtt_client)

            self.pijuice = {
                'charge_battery': False,
                'shutdown_delay': 123,
                'shutdown_level': 10,
                'wake_up_on_charge': 15
            }

        subject = self.create_subject(mocker, set_pijuice)

        assert subject.state == DeviceStatus.UNKNOWN
        assert subject.has_pijuice is True

        future = Future()
        future.set_result(None)
        self.shutdown.shutdown.return_value = future

        def mock_battery(level: int, charging: Union[bool, None] = None):
            type(self.pijuice_interface).battery_level = PropertyMock(
                return_value=level
            )

            type(self.pijuice_interface).battery_charging = PropertyMock(
                return_value=charging
            )

            self.pijuice_interface.reset_mock()
            self.shutdown.reset_mock()

        # expected to do nothing as the battery is over the level
        levels = [100, 50, 11]
        for level in levels:
            mock_battery(level)

            await subject.poll()

            self.pijuice_interface.shutdown.assert_not_called()
            self.shutdown.shutdown.assert_not_called()

            self.publish.assert_any_call(
                'device/local/battery',
                {'value': level, 'unit': '%'}
            )

        # expected to shutdown
        levels = [10, 9, 1]
        for level in levels:
            mock_battery(level, True)

            await subject.poll()

            self.pijuice_interface.shutdown.assert_called_once_with(123)
            self.shutdown.shutdown.assert_called_once()

            self.publish.assert_any_call(
                'device/local/battery',
                {'value': level, 'unit': '%', 'charging': True}
            )
