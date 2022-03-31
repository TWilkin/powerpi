import pytest

from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase


class DeviceImpl(Device, PollableMixin):
    #pytest: disable=too-many-arguments
    def __init__(self, config, logger, mqtt_client, name: str, poll_frequency=60):
        Device.__init__(self, config, logger, mqtt_client, name=name)
        PollableMixin.__init__(self, config, poll_frequency)

    async def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestPollableMixin(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='pollable'
        )

    def test_poll_frequency_default(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        self.config.poll_frequency = 120

        device = DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='pollable', poll_frequency=120
        )

        assert device.polling_enabled is True
        assert device.poll_frequency == 120

    @pytest.mark.parametrize('value', [1, 9])
    def test_poll_frequency_too_small(self, mocker: MockerFixture, value: int):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        device = DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='pollable', poll_frequency=value
        )

        assert device.polling_enabled is True
        assert device.poll_frequency == 10

    @pytest.mark.parametrize('value', [-1, 0])
    def test_poll_frequency_disable(self, mocker: MockerFixture, value: int):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        device = DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='pollable', poll_frequency=value
        )

        assert device.polling_enabled is False
