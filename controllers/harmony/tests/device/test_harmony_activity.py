from asyncio import Future
from unittest.mock import MagicMock

import pytest
from powerpi_common.device import DeviceManager
from powerpi_common_test.device import DeviceTestBase
from pytest_mock import MockerFixture

from harmony_controller.device.harmony_activity import HarmonyActivityDevice


class TestHarmonyActivityDevice(DeviceTestBase):

    @pytest.mark.asyncio
    async def test_turn_on_hub(self, subject: HarmonyActivityDevice, harmony_hub: MagicMock):
        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'on'

        harmony_hub.start_activity.assert_called_once_with('my activity')

    @pytest.mark.asyncio
    async def test_turn_on_hub_error(self, subject: HarmonyActivityDevice, harmony_hub: MagicMock):
        async def start_activity(_: str):
            raise KeyError('error')
        harmony_hub.start_activity = start_activity

        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_turn_off_hub(self, subject: HarmonyActivityDevice, harmony_hub: MagicMock):
        assert subject.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'off'

        harmony_hub.turn_off.assert_called_once()

    @pytest.mark.asyncio
    async def test_turn_off_hub_error(self, subject: HarmonyActivityDevice, harmony_hub: MagicMock):
        async def turn_off(_: str):
            raise KeyError('error')
        harmony_hub.turn_off = turn_off

        assert subject.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'unknown'

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager: DeviceManager,
        harmony_hub,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments
        mocker.patch.object(
            powerpi_device_manager,
            'get_device',
            return_value=harmony_hub
        )

        return HarmonyActivityDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            'hub',
            'my activity',
            name='testactivity'
        )

    @pytest.fixture
    def harmony_hub(self, mocker: MockerFixture):
        hub = mocker.MagicMock()

        future = Future()
        future.set_result(None)
        for method in ['start_activity', 'turn_on', 'turn_off']:
            mocker.patch.object(
                hub,
                method,
                return_value=future
            )

        return hub
