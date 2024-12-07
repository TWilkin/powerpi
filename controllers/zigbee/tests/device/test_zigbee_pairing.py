from asyncio import Future
from unittest.mock import MagicMock, PropertyMock, call

import pytest
from powerpi_common_test.device import DeviceTestBase
from pytest_mock import MockerFixture
from zigpy.typing import DeviceType

from zigbee_controller.device.zigbee_pairing import ZigbeePairingDevice


class TestZigbeePairingDevice(DeviceTestBase):
    @pytest.mark.asyncio
    async def test_pair(self, subject: ZigbeePairingDevice, zigbee_controller: MagicMock):
        assert subject.state == 'unknown'

        await subject.pair()

        # once to turn it on with the timeout (1), then once to turn it off (0)
        zigbee_controller.pair.assert_has_calls([call(1), call(0)])

        assert subject.state == 'off'

    def test_on_device_join(
        self,
        subject: ZigbeePairingDevice,
        powerpi_mqtt_producer: MagicMock,
        device: DeviceType
    ):
        subject.on_device_join(device)

        topic = 'device/ZigBeePairing/join'
        message = {
            'nwk': '0x0abc',
            'ieee': '0f:0d:0b:09:07:05:03:01'
        }
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        zigbee_controller,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments
        future = Future()
        future.set_result(None)
        mocker.patch.object(
            zigbee_controller,
            'pair',
            return_value=future
        )

        return ZigbeePairingDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, zigbee_controller,
            1, name='ZigBeePairing'
        )

    @pytest.fixture
    def device(self, mocker: MockerFixture):
        device = mocker.MagicMock()

        type(device).ieee = PropertyMock(
            return_value=[(i * 2) - 1 for i in range(1, 9)]
        )
        type(device).nwk = PropertyMock(return_value=2748)

        return device
