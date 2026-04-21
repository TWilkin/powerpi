import pytest
from powerpi_common_test.device import DeviceTestBase

from powerpi_common.device import Device, DeviceStatus


class DeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client, variable_manager):
        Device.__init__(
            self,
            config=config,
            logger=logger,
            mqtt_client=mqtt_client,
            variable_manager=variable_manager,
            name='test'
        )

    async def _turn_on(self):
        return True

    async def _turn_off(self):
        return True


class TestDevice(DeviceTestBase):

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_variable_manager
    ):
        return DeviceImpl(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_variable_manager
        )


class BadDeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client, variable_manager):
        Device.__init__(
            self,
            config=config,
            logger=logger,
            mqtt_client=mqtt_client,
            variable_manager=variable_manager,
            name='Test'
        )

        self.update_state_no_broadcast(DeviceStatus.ON)

    async def _turn_on(self):
        return False

    async def _turn_off(self):
        return False


class TestBadDevice:

    @pytest.mark.asyncio
    async def test_turn_on(
        self,
        subject: BadDeviceImpl,
        powerpi_mqtt_producer
    ):
        assert subject.state == DeviceStatus.ON

        await subject.turn_on()

        assert subject.state == DeviceStatus.UNKNOWN

        powerpi_mqtt_producer.assert_called_once_with(
            'device/Test/status',
            {'state': DeviceStatus.UNKNOWN}
        )

    @pytest.mark.asyncio
    async def test_turn_off(
        self,
        subject: BadDeviceImpl,
        powerpi_mqtt_producer
    ):
        assert subject.state == DeviceStatus.ON

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

        powerpi_mqtt_producer.assert_called_once_with(
            'device/Test/status',
            {'state': DeviceStatus.UNKNOWN}
        )

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_variable_manager
    ):
        return BadDeviceImpl(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_variable_manager
        )
