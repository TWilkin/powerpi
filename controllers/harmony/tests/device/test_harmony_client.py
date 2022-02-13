import pytest

from pytest import raises
from pytest_mock import MockerFixture
from unittest.mock import patch

from harmony_controller.device.harmony_client import HarmonyClient


class TestHarmonyClient(object):
    pytestmark = pytest.mark.asyncio

    def get_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()

        client = HarmonyClient(self.logger)
        client.address = 'my.harmony.address'
        client.port = 1337
        return client

    async def test_get_config(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with patch('pyharmony.client.create_and_connect_client') as harmony:
            await subject.get_config()

            harmony.assert_called_once_with(subject.address, subject.port)
            harmony().get_config.assert_called_once()

    async def test_get_current_activity(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with patch('pyharmony.client.create_and_connect_client') as harmony:
            await subject.get_current_activity()

            harmony.assert_called_once_with(subject.address, subject.port)
            harmony().get_current_activity.assert_called_once()

    async def test_start_activity(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        activity = 'Test Activity'
        with patch('pyharmony.client.create_and_connect_client') as harmony:
            await subject.start_activity(activity)

            harmony.assert_called_once_with(subject.address, subject.port)
            harmony().start_activity.assert_called_once_with(activity)

    async def test_power_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with patch('pyharmony.client.create_and_connect_client') as harmony:
            await subject.power_off()

            harmony.assert_called_once_with(subject.address, subject.port)
            harmony().power_off.assert_called_once()

    async def test_reconnect(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with patch('pyharmony.client.create_and_connect_client') as harmony:
            harmony.return_value = False

            with raises(ConnectionError):
                await subject.power_off()

            harmony.assert_has_calls(
                [
                    mocker.call(subject.address, subject.port),
                    mocker.call(subject.address, subject.port)
                ]
            )
