from unittest.mock import AsyncMock, MagicMock, PropertyMock, patch

import pytest
from harmony_controller.device.harmony_client import HarmonyClient
from pytest import raises
from pytest_mock import MockerFixture


class TestHarmonyClient(object):
    pytestmark = pytest.mark.asyncio

    async def test_get_config(self, subject: HarmonyClient, mock_api: MagicMock):
        await subject.get_config()

        mock_api.assert_called_once_with(subject.address)
        mock_api.return_value.connect.assert_called_once()

    @pytest.mark.skip(reason='the property mock isn\'t working')
    async def test_get_current_activity(self, subject: HarmonyClient, mock_api: MagicMock):
        type(mock_api).current_activity = PropertyMock(
            return_value=(-1, 'off')
        )

        result = await subject.get_current_activity()

        mock_api.assert_called_once_with(subject.address)

        assert result == -1

    async def test_start_activity(self, subject: HarmonyClient, mock_api: MagicMock):
        activity = 'Test Activity'

        mock_api.return_value.start_activity = AsyncMock()

        await subject.start_activity(activity)

        mock_api.assert_called_once_with(subject.address)
        mock_api.return_value.start_activity.assert_called_once_with(activity)

    async def test_power_off(self, subject: HarmonyClient, mock_api: MagicMock):
        mock_api.return_value.power_off = AsyncMock()

        await subject.power_off()

        mock_api.assert_called_once_with(subject.address)
        mock_api.return_value.power_off.assert_called_once()

    async def test_reconnect(self, subject: HarmonyClient, mock_api: MagicMock, mocker: MockerFixture):
        mock_connect = AsyncMock()
        mock_connect.return_value = False
        mock_api.return_value.connect = mock_connect

        with raises(ConnectionError):
            await subject.power_off()

        mock_api.assert_has_calls([mocker.call(subject.address)])

    @pytest.fixture
    def subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()

        client = HarmonyClient(self.logger)
        client.address = 'my.harmony.address'

        return client

    @pytest.fixture
    def mock_api(self, mocker: MockerFixture):
        mock_api = mocker.patch(
            'harmony_controller.device.harmony_client.HarmonyAPI'
        )

        mock_connect = AsyncMock()
        mock_connect.return_value = True
        mock_api.return_value.connect = mock_connect

        return mock_api
