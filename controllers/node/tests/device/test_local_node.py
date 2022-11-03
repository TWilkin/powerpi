from typing import List, Tuple, Union
from unittest.mock import PropertyMock, call

import pytest
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

        self.pwm_fan_controller = mocker.Mock()
        self.service_provider.pwm_fan_controller = lambda **_: self.pwm_fan_controller

        return LocalNodeDevice(
            self.config,
            self.logger,
            self.mqtt_client,
            self.service_provider,
            self.shutdown,
            getattr(self, 'pijuice', None),
            getattr(self, 'pwm_fan', None),
            name='local',
            poll_frequency=60
        )

    async def test_config_defaults(self, mocker: MockerFixture):
        def set_addons():
            self.pijuice = {}
            self.pwm_fan = {}

        subject = self.create_subject(mocker, set_addons)

        assert subject.has_pijuice is True
        assert subject.pijuice_config['charge_battery'] is True
        assert subject.pijuice_config['max_charge'] == 100
        assert subject.pijuice_config['shutdown_delay'] == 120
        assert subject.pijuice_config['shutdown_level'] == 20
        assert subject.pijuice_config['wake_up_on_charge'] == 25

        assert subject.has_pwm_fan is True
        assert len(subject.pwm_fan_config['curve']) == 4
        assert subject.pwm_fan_config['curve'][0] == {
            'temperature': 30, 'speed': 25
        }
        assert subject.pwm_fan_config['curve'][1] == {
            'temperature': 40, 'speed': 50
        }
        assert subject.pwm_fan_config['curve'][2] == {
            'temperature': 50, 'speed': 75
        }
        assert subject.pwm_fan_config['curve'][3] == {
            'temperature': 60, 'speed': 100
        }

    @pytest.mark.parametrize('charge_battery', [True, False])
    @pytest.mark.parametrize('max_charge', [90])
    @pytest.mark.parametrize('shutdown_delay', [60])
    @pytest.mark.parametrize('shutdown_level', [10])
    @pytest.mark.parametrize('wake_up_on_charge', [15])
    @pytest.mark.parametrize('curve', [
        [(10, 20), (30, 40)],
        [(20, 10), (40, 30)],
    ])
    async def test_config_override(
        self,
        mocker: MockerFixture,
        charge_battery: bool,
        max_charge: int,
        shutdown_delay: int,
        shutdown_level: int,
        wake_up_on_charge: int,
        curve: List[Tuple[int, int]]
    ):
        # pylint: disable=too-many-arguments
        def set_addons():
            self.pijuice = {
                'charge_battery': charge_battery,
                'max_charge': max_charge,
                'shutdown_delay': shutdown_delay,
                'shutdown_level': shutdown_level,
                'wake_up_on_charge': wake_up_on_charge
            }

            self.pwm_fan = {
                'curve': [
                    {'temperature': value[0], 'speed': value[1]}
                    for value in curve
                ]
            }

        subject = self.create_subject(mocker, set_addons)

        assert subject.has_pijuice is True
        assert subject.pijuice_config['charge_battery'] is charge_battery
        assert subject.pijuice_config['max_charge'] == max_charge
        assert subject.pijuice_config['shutdown_delay'] == shutdown_delay
        assert subject.pijuice_config['shutdown_level'] == shutdown_level
        assert subject.pijuice_config['wake_up_on_charge'] == wake_up_on_charge

        assert subject.has_pwm_fan is True
        assert len(subject.pwm_fan_config['curve']) == len(curve)
        assert subject.pwm_fan_config['curve'] == [
            {'temperature': value[0], 'speed': value[1]}
            for value in curve
        ]

    async def test_deinitialise_set_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.deinitialise()

        assert subject.state == DeviceStatus.OFF

    async def test_poll_set_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.poll()

        assert subject.state == DeviceStatus.ON

    async def test_poll_no_addons(self, mocker: MockerFixture):
        def set_producer():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, set_producer)

        assert subject.has_pijuice is False
        assert subject.has_pwm_fan is False

        await subject.poll()

        self.publish.assert_called_once_with(
            'device/local/status',
            {'state': 'on'}
        )

    async def test_poll_with_pijuice(self, mocker: MockerFixture):
        def set_pijuice():
            self.publish = mock_producer(mocker, self.mqtt_client)

            self.pijuice = {
                'charge_battery': False,
                'max_charge': 80,
                'shutdown_delay': 123,
                'shutdown_level': 10,
                'wake_up_on_charge': 15
            }

        subject = self.create_subject(mocker, set_pijuice)

        assert subject.state == DeviceStatus.UNKNOWN
        assert subject.has_pijuice is True

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

    async def test_poll_max_charge(self, mocker: MockerFixture):
        def set_pijuice():
            self.pijuice = {
                'charge_battery': True,
                'max_charge': 80
            }

        subject = self.create_subject(mocker, set_pijuice)

        def mock_battery(level: int):
            type(self.pijuice_interface).battery_level = PropertyMock(
                return_value=level
            )

        mock_battery(79)
        await subject.poll()
        self.pijuice_interface.charge_battery.assert_not_called()

        mock_battery(80)
        await subject.poll()
        assert self.pijuice_interface.charge_battery is False

        mock_battery(81)
        await subject.poll()
        assert self.pijuice_interface.charge_battery is False

        mock_battery(79)
        await subject.poll()
        assert self.pijuice_interface.charge_battery is True

    @pytest.mark.parametrize('has_cpu_temps', [True, False])
    @pytest.mark.parametrize('has_battery_temps', [True, False, None])
    @pytest.mark.parametrize('has_fan_speed', [True, False])
    async def test_poll_pwm(
        self,
        mocker: MockerFixture,
        has_cpu_temps: bool,
        has_battery_temps: Union[bool, None],
        has_fan_speed: bool
    ):
        def set_pwm_fan():
            self.publish = mock_producer(mocker, self.mqtt_client)

            if has_battery_temps is not None:
                self.pijuice = {}

            self.pwm_fan = {
                'curve': [
                    {'temperature': 20, 'speed': 20},
                    {'temperature': 30, 'speed': 40}
                ]
            }

        subject = self.create_subject(mocker, set_pwm_fan)

        assert subject.state == DeviceStatus.UNKNOWN
        assert subject.has_pwm_fan is True

        type(self.pijuice_interface).battery_level = PropertyMock(
            return_value=100
        )
        type(self.pijuice_interface).battery_charging = PropertyMock(
            return_value=False
        )

        type(self.pwm_fan_controller).cpu_temps = PropertyMock(
            return_value=[1, 2, 3, 4, 5] if has_cpu_temps else []
        )

        type(self.pwm_fan_controller).battery_temps = PropertyMock(
            return_value=[1, 2, 3, 4, 5] if has_battery_temps else []
        )

        type(self.pwm_fan_controller).fan_speeds = PropertyMock(
            return_value=[1000, 2000, 3000, 4000, 5000]
            if has_fan_speed else []
        )

        await subject.poll()

        calls = [
            call(
                'device/local/status',
                {'state': 'on'}
            )
        ]

        if has_cpu_temps:
            calls.append(call(
                'device/local/cpu_temperature',
                {'value': 3, 'unit': '°C'}
            ))

        if has_battery_temps is not None:
            calls.append(call(
                'device/local/battery',
                {'value': 100, 'unit': '%', 'charging': False}
            ))

        if has_battery_temps:
            calls.append(call(
                'device/local/battery_temperature',
                {'value': 3, 'unit': '°C'}
            ))

        if has_fan_speed:
            calls.append(call(
                'device/local/fan_speed',
                {'value': 3000, 'unit': 'rpm'}
            ))

        print(self.publish.call_args)

        self.publish.assert_has_calls(calls, True)
