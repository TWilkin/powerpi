import pytest
from pytest_mock import MockerFixture

from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.variable import VariableManager, VariableType
from powerpi_common_test.base import BaseTest


class DeviceVariableImpl:
    def __init__(self, name: str):
        self.name = name
        self.variable_type = VariableType.DEVICE


class SensorVariableImpl:
    def __init__(self, name: str, action: str):
        self.name = name
        self.action = action
        self.variable_type = VariableType.SENSOR


class TestVariableManager(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.service_provider = mocker.Mock()

        return VariableManager(self.logger, self.device_manager, self.service_provider)

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_adds(self, mocker: MockerFixture, variable_type: VariableType):
        subject = self.create_subject(mocker)

        def not_found(name: str):
            raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)
        self.device_manager.get_device = not_found
        self.device_manager.get_sensor = not_found

        self.service_provider.device_variable = DeviceVariableImpl
        self.service_provider.sensor_variable = SensorVariableImpl

        name = 'new_variable'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result.name == name
        assert result.variable_type == variable_type

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_from_manager(self, mocker: MockerFixture, variable_type: VariableType):
        subject = self.create_subject(mocker)

        self.device_manager.get_device = DeviceVariableImpl
        self.device_manager.get_sensor = lambda name: SensorVariableImpl(
            name, 'action'
        )

        name = 'found_device'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result.name == name
        assert result.variable_type == variable_type

        self.service_provider.device_variable.assert_not_called()
        self.service_provider.sensor_variable.assert_not_called()

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_exists(self, mocker: MockerFixture, variable_type: VariableType):
        subject = self.create_subject(mocker)

        name = 'found_variable'

        variable = DeviceVariableImpl(name) if variable_type == VariableType.DEVICE \
            else SensorVariableImpl(name, 'action')

        # ensure it's already there
        subject.add(variable)

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name, 'action')

        assert result is not None
        assert result == variable

        self.device_manager.get_device.assert_not_called()
        self.device_manager.get_sensor.assert_not_called()

        self.service_provider.device_variable.assert_not_called()
        self.service_provider.sensor_variable.assert_not_called()
