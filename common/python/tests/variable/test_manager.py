import pytest

from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.variable import VariableManager, VariableType


class DeviceVariableImpl:
    def __init__(self, name: str):
        self.name = name
        self.variable_type = VariableType.DEVICE


class SensorVariableImpl:
    def __init__(self, name: str, action: str):
        self.name = name
        self.action = action
        self.variable_type = VariableType.SENSOR


class TestVariableManager:

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_adds(
        self,
        subject: VariableManager,
        powerpi_device_manager,
        powerpi_service_provider,
        variable_type: VariableType
    ):
        def not_found(name: str):
            raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)
        powerpi_device_manager.get_device = not_found
        powerpi_device_manager.get_sensor = not_found

        powerpi_service_provider.device_variable = DeviceVariableImpl
        powerpi_service_provider.sensor_variable = SensorVariableImpl

        name = 'new_variable'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result.name == name
        assert result.variable_type == variable_type

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_from_manager(
        self,
        subject: VariableManager,
        powerpi_device_manager,
        powerpi_service_provider,
        variable_type: VariableType
    ):
        powerpi_device_manager.get_device = DeviceVariableImpl
        powerpi_device_manager.get_sensor = lambda name: SensorVariableImpl(
            name, 'action'
        )

        name = 'found_device'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result.name == name
        assert result.variable_type == variable_type

        powerpi_service_provider.device_variable.assert_not_called()
        powerpi_service_provider.sensor_variable.assert_not_called()

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_exists(
        self,
        subject: VariableManager,
        powerpi_device_manager,
        powerpi_service_provider,
        variable_type: VariableType
    ):
        name = 'found_variable'

        variable = DeviceVariableImpl(name) if variable_type == VariableType.DEVICE \
            else SensorVariableImpl(name, 'action')

        # ensure it's already there
        subject.add(variable)

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result == variable

        powerpi_device_manager.get_device.assert_not_called()
        powerpi_device_manager.get_sensor.assert_not_called()

        powerpi_service_provider.device_variable.assert_not_called()
        powerpi_service_provider.sensor_variable.assert_not_called()

    @pytest.fixture
    def subject(self, powerpi_logger, powerpi_device_manager, powerpi_service_provider):
        return VariableManager(powerpi_logger, powerpi_device_manager, powerpi_service_provider)
