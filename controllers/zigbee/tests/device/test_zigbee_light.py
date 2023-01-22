from asyncio import Future
from typing import List
from unittest.mock import MagicMock, call

import pytest
from powerpi_common_test.device import AdditionalStateDeviceTestBaseNew
from powerpi_common_test.device.mixin import (InitialisableMixinTestBaseNew,
                                              PollableMixingTestBaseNew)
from pytest_mock import MockerFixture
from zigbee_controller.device.zigbee_light import ZigbeeLight
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status


class TestZigbeeeLight(
    AdditionalStateDeviceTestBaseNew,
    InitialisableMixinTestBaseNew,
    PollableMixingTestBaseNew
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
        #pylint: disable=too-many-arguments
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
            'brightness': 51_400
        }
        if colour:
            expected['hue'] = 256
            expected['saturation'] = 40
        if temperature:
            expected['temperature'] = 6667

        assert subject.state == 'on' if state else 'off'
        assert subject.additional_state == expected

        topic = 'device/Light/status'
        message = {
            'state': 'on' if state else 'off',
            **expected
        }
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

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
            raise DeliveryError()

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
        mocker: MockerFixture,
        colour: bool,
        temperature: bool
    ):
        #pylint: disable=too-many-arguments
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

        assert subject.supports_colour is None
        assert subject.supports_temperature is None
        assert subject.temperature_range is None

        await subject.initialise()

        assert subject.supports_colour is colour
        assert subject.supports_temperature is temperature
        assert subject.temperature_range.min == 100
        assert subject.temperature_range.max == 200

    @pytest.mark.asyncio
    async def test_initialise_sets_options(
        self,
        subject: ZigbeeLight,
        cluster: Cluster,
        mocker: MockerFixture
    ):
        await subject.initialise()

        write = mocker.MagicMock()
        cluster.write_attributes.side_effect = write

        write.has_calls([
            call({'options': 1}),  # ColorCluster
            call({'options': 1}),  # LevelControlCluster
        ])

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

        async def write_attributes(_):
            pass

        mocker.patch.object(
            zigbee_in_cluster,
            'write_attributes',
            write_attributes
        )

        return zigbee_in_cluster
