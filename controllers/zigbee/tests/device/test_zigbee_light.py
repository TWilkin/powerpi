from asyncio import Future
from typing import List
from unittest.mock import AsyncMock, MagicMock, PropertyMock, call

import pytest
from powerpi_common.device.mixin import AdditionalState
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import (InitialisableMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status

from zigbee_controller.device.zigbee_light import ZigbeeLight


class TestZigbeeLight(
    AdditionalStateDeviceTestBase,
    InitialisableMixinTestBase,
    PollableMixinTestBase
):
    def test_duration(self, subject: ZigbeeLight):
        assert subject.duration == 13

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [True, False])
    @pytest.mark.parametrize('colour', [True, False])
    @pytest.mark.parametrize('temperature', [True, False])
    async def test_poll_gets_values(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        state: bool,
        colour: bool,
        temperature: bool
    ):
        # pylint: disable=too-many-arguments
        capability = (1 if colour else 0) | (0b10000 if temperature else 0)

        async def read_attributes(_):
            return ({
                'color_capabilities': capability,
                'color_temp_physical_min': 100,
                'color_temp_physical_max': 200,
                'on_off': state,
                'current_level': 200,
                'color_temperature': 150,
                'current_hue': 180,
                'current_saturation': 100
            }, None)

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.poll()

        expected = {
            'brightness': 78.43
        }
        if colour:
            expected['hue'] = 256
            expected['saturation'] = 39.37
        if temperature:
            expected['temperature'] = 6667

        assert subject.state == 'on' if state else 'off'
        assert subject.additional_state == expected

        topic = 'device/Light/status'
        message = {
            'scene': 'default',
            'state': 'on' if state else 'off',
            **expected
        }
        powerpi_mqtt_producer.assert_called_with(topic, message)

        # polling again doesn't produce anything as nothing changed
        powerpi_mqtt_producer.reset_mock()

        await subject.poll()

        assert subject.state == 'on' if state else 'off'
        assert subject.additional_state == expected

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    async def test_poll_fails(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture
    ):
        async def read_attributes(_):
            raise DeliveryError('Boom')

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.poll()

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('colour', [True, False])
    @pytest.mark.parametrize('temperature', [True, False])
    async def test_initialise_gets_capabilities(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        colour: bool,
        temperature: bool
    ):
        # pylint: disable=too-many-arguments
        capability = (1 if colour else 0) | (0b10000 if temperature else 0)

        async def read_attributes(_):
            return ({
                'color_capabilities': capability,
                'color_temp_physical_min': 100,
                'color_temp_physical_max': 200
            }, None)

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        assert subject.supports_brightness is True
        assert subject.supports_colour_hue_and_saturation is False
        assert subject.supports_colour_temperature is False

        await subject.initialise()

        assert subject.supports_colour_hue_and_saturation is colour

        if temperature:
            assert subject.supports_colour_temperature.min == 5000
            assert subject.supports_colour_temperature.max == 10000
        else:
            assert subject.supports_colour_temperature is False

        # the updated capability should be broadcast
        powerpi_mqtt_producer.assert_called_once()

    @pytest.mark.asyncio
    async def test_initialise_sets_options(
        self,
        subject: ZigbeeLight,
        cluster: Cluster
    ):
        await subject.initialise()

        cluster.write_attributes.assert_has_calls([
            call({'options': 1}),  # ColorCluster
            call({'options': 1}),  # LevelControlCluster
        ])

    @pytest.mark.asyncio
    @pytest.mark.parametrize('colour', [True, False])
    @pytest.mark.parametrize('temperature', [True, False])
    @pytest.mark.parametrize('additional_state', [
        {},
        {'brightness': 78.43},
        {'temperature': 6667},
        {'hue': 180, 'saturation': 50},
        {'brightness': 78.43, 'temperature': 6667},
        {'brightness': 78.43, 'hue': 180, 'saturation': 50},
        {'brightness': 78.43, 'temperature': 6667, 'hue': 180, 'saturation': 50}
    ])
    async def test_on_additional_state_change_sets_values(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        mocker: MockerFixture,
        colour: bool,
        temperature: bool,
        additional_state: AdditionalState
    ):
        # pylint: disable=too-many-arguments
        capability = (1 if colour else 0) | (0b10000 if temperature else 0)

        async def read_attributes(_):
            return ({
                'color_capabilities': capability,
                'color_temp_physical_min': 100,
                'color_temp_physical_max': 200
            }, None)

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        def command(name: str):
            commands = {
                'move_to_level': 1,
                'move_to_color_temp': 2,
                'move_to_hue_and_saturation': 3
            }

            mock = mocker.MagicMock()
            type(mock).id = PropertyMock(return_value=commands[name])

            return mock
        cluster.commands_by_name.__getitem__.side_effect = command

        result = await subject.on_additional_state_change(additional_state)

        expected_command_calls = []
        expected_write_calls = [
            call({'options': 1}),
            call({'options': 1})
        ]

        if temperature:
            assert result.get('temperature') \
                == additional_state.get('temperature')

            if 'temperature' in additional_state:
                expected_command_calls.append(call(
                    2, color_temp_mireds=150, transition_time=13
                ))
                expected_write_calls.append(call(
                    {'start_up_color_temperature': 150}
                ))
        else:
            assert 'temperature' not in result

        if colour:
            assert result.get('hue') \
                == additional_state.get('hue')

            assert result.get('saturation') \
                == additional_state.get('saturation')

            if 'hue' in additional_state:
                expected_command_calls.append(call(
                    3, hue=127, saturation=127, transition_time=13
                ))
        else:
            assert 'hue' not in result
            assert 'saturation' not in result

        assert result.get('brightness') \
            == additional_state.get('brightness')

        if 'brightness' in additional_state:
            expected_command_calls.append(call(
                1, level=200, transition_time=13
            ))
            expected_write_calls.append(call(
                {'start_up_current_level': 200}
            ))

        if len(expected_command_calls) > 0:
            cluster.command.assert_has_calls(expected_command_calls)
        else:
            cluster.command.assert_not_called()

        if len(expected_write_calls) > 0:
            cluster.write_attributes.assert_has_calls(expected_write_calls)
        else:
            cluster.write_attributes.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('additional_state', [
        {'brightness': 78.43},
        {'temperature': 6667},
        {'hue': 180, 'saturation': 50}
    ])
    async def test_on_additional_state_fails(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        mocker: MockerFixture,
        additional_state: AdditionalState
    ):
        async def read_attributes(_):
            return ({
                'color_capabilities': 0b10001,
                'color_temp_physical_min': 100,
                'color_temp_physical_max': 200
            }, None)

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        def command(_: str):
            mock = mocker.MagicMock()
            type(mock).id = PropertyMock(return_value=1)

            return mock
        cluster.commands_by_name.__getitem__.side_effect = command

        cluster.command.side_effect = DeliveryError('Boom')

        result = await subject.on_additional_state_change(additional_state)

        assert result == {}

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        zigbee_controller
    ):
        return ZigbeeLight(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, zigbee_controller,
            1234,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='Light'
        )

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_in_cluster: Cluster, mocker: MockerFixture):
        future = Future()
        future.set_result({'status': Status.SUCCESS})
        zigbee_in_cluster.command.return_value = future

        async def read_attributes(attributes: List[str]):
            return (dict(zip(attributes, [0 for _ in attributes])), None)

        mocker.patch.object(
            zigbee_in_cluster,
            'read_attributes',
            read_attributes
        )

        mocker.patch.object(
            zigbee_in_cluster,
            'write_attributes',
            AsyncMock()
        )

        return zigbee_in_cluster
