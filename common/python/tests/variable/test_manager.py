import pytest
from pytest_mock import MockerFixture

from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.variable import VariableManager, VariableType
from powerpi_common_test.base import BaseTest


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

        self.service_provider.device_variable = lambda name: f'device: {name}'
        self.service_provider.sensor_variable = lambda name: f'sensor: {name}'

        name = 'new_variable'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name)

        assert result is not None
        assert result == f'{variable_type}: new_variable'

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_from_manager(self, mocker: MockerFixture, variable_type: VariableType):
        subject = self.create_subject(mocker)

        self.device_manager.get_device = lambda name: f'device: {name}'
        self.device_manager.get_sensor = lambda name: f'sensor: {name}'

        name = 'found_device'

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name)

        assert result is not None
        assert result == f'{variable_type}: found_device'

        self.service_provider.device_variable.assert_not_called()
        self.service_provider.sensor_variable.assert_not_called()

    @pytest.mark.parametrize('variable_type', [VariableType.DEVICE, VariableType.SENSOR])
    def test_get_x_exists(self, mocker: MockerFixture, variable_type: VariableType):
        subject = self.create_subject(mocker)

        def not_found(name: str):
            raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)
        self.device_manager.get_device = not_found
        self.device_manager.get_sensor = not_found

        self.service_provider.device_variable = lambda name: f'device: {name}'
        self.service_provider.sensor_variable = lambda name: f'sensor: {name}'

        name = 'found_variable'

        # ensure it's already there
        if variable_type == VariableType.DEVICE:
            subject.get_device(name)
        else:
            subject.get_sensor(name)

        # then reset
        self.device_manager.get_device = mocker.Mock()
        self.device_manager.get_sensor = mocker.Mock()
        self.service_provider.device_variable = mocker.Mock()
        self.service_provider.sensor_variable = mocker.Mock()

        result = subject.get_device(name) if variable_type == VariableType.DEVICE \
            else subject.get_sensor(name)

        assert result is not None
        assert result == f'{variable_type}: found_variable'

        self.device_manager.get_device.assert_not_called()
        self.device_manager.get_sensor.assert_not_called()

        self.service_provider.device_variable.assert_not_called()
        self.service_provider.sensor_variable.assert_not_called()
