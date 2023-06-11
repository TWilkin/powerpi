import pytest
from powerpi_common_test.device import DeviceTestBaseNew
from powerpi_common_test.device.mixin import PollableMixinTestBaseNew

from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin


class DeviceImpl(Device, PollableMixin):
    # pylint: disable=too-many-ancestors

    def __init__(self, config, logger, mqtt_client, name: str, poll_frequency=60):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, name=name)
        PollableMixin.__init__(self, config, poll_frequency)

    async def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestPollableMixin(DeviceTestBaseNew, PollableMixinTestBaseNew):

    def test_poll_frequency_default(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        device = DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='pollable', poll_frequency=120
        )

        assert device.polling_enabled is True
        assert device.poll_frequency == 120

    @pytest.mark.parametrize('value', [1, 9])
    def test_poll_frequency_too_small(
        self, powerpi_config, powerpi_logger, powerpi_mqtt_client, value: int
    ):
        device = DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='pollable', poll_frequency=value
        )

        assert device.polling_enabled is True
        assert device.poll_frequency == 10

    @pytest.mark.parametrize('value', [-1, 0])
    def test_poll_frequency_disable(
        self, powerpi_config, powerpi_logger, powerpi_mqtt_client, value: int
    ):
        device = DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='pollable', poll_frequency=value
        )

        assert device.polling_enabled is False

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='pollable'
        )
