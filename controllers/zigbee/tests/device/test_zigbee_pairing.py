from asyncio import Future, create_task, gather
from unittest.mock import AsyncMock, MagicMock, PropertyMock, call

import pytest
from powerpi_common_test.device import DeviceTestBase
from pytest_mock import MockerFixture
from zigpy.device import Device as ZigPyDevice

from zigbee_controller.device.zigbee_pairing import ZigbeePairingDevice


class TestZigbeePairingDevice(DeviceTestBase):
    @pytest.mark.asyncio
    async def test_pair(
        self,
        subject: ZigbeePairingDevice,
        zigbee_controller: MagicMock,
        mocker: MockerFixture
    ):
        captured_task: Future | None

        def capture(task: Future):
            nonlocal captured_task
            captured_task = create_task(task)
            return captured_task

        mocker.patch(
            'zigbee_controller.device.zigbee_pairing.create_task',
            side_effect=capture
        )
        assert subject.state == 'unknown'

        await subject.turn_on()

        await gather(captured_task)

        # once to turn it on with the timeout (1), then once to turn it off (0)
        zigbee_controller.pair.assert_has_calls([call(1), call(0)])

        assert subject.state == 'off'

    def test_on_device_join(
        self,
        subject: ZigbeePairingDevice,
        powerpi_mqtt_producer: MagicMock,
        device: ZigPyDevice
    ):
        subject.on_device_join(device)

        device.cancel_initialization.assert_called_once()

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
        powerpi_variable_manager,
        zigbee_controller,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments
        future = Future()
        future.set_result(True)
        mocker.patch.object(
            zigbee_controller,
            'pair',
            return_value=future
        )

        return ZigbeePairingDevice(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            variable_manager=powerpi_variable_manager,
            zigbee_controller=zigbee_controller,
            timeout=1,
            name='ZigBeePairing'
        )

    @pytest.fixture
    def device(self, mocker: MockerFixture):
        device = mocker.MagicMock()

        type(device).ieee = PropertyMock(
            return_value=[(i * 2) - 1 for i in range(1, 9)]
        )
        type(device).nwk = PropertyMock(return_value=2748)

        return device

    @pytest.fixture(autouse=True)
    def sleep(self, mocker: MockerFixture):
        mocker.patch(
            'zigbee_controller.device.zigbee_pairing.sleep',
            new_callable=AsyncMock
        )
