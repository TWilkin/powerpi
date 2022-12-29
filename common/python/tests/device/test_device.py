import pytest
from powerpi_common.device import Device, DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from pytest_mock import MockerFixture


class DeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client):
        Device.__init__(
            self, config, logger, mqtt_client,
            name='test'
        )

    async def _turn_on(self):
        return True

    async def _turn_off(self):
        return True


class TestDevice(DeviceTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(self.config, self.logger, self.mqtt_client)


class BadDeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client):
        Device.__init__(
            self, config, logger, mqtt_client,
            name='test'
        )

    async def _turn_on(self):
        return False

    async def _turn_off(self):
        return False


class TestBadDevice:
    @pytest.mark.asyncio
    async def test_turn_on(self, subject: BadDeviceImpl):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_on()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    async def test_turn_off(self, subject: BadDeviceImpl):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.fixture
    def subject(self, mocker: MockerFixture):
        return BadDeviceImpl(mocker.Mock(), mocker.Mock(), mocker.Mock())
