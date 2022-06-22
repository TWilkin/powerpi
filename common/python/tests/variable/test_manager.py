from pytest_mock import MockerFixture

from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.variable import VariableManager
from powerpi_common_test.base import BaseTest


class TestVariableManager(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.service_provider = mocker.Mock()

        return VariableManager(self.logger, self.device_manager, self.service_provider)

    def test_get_device_adds(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        def not_found(name: str):
            raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)
        self.device_manager.get_device = not_found

        self.service_provider.device_variable = lambda name: f'device: {name}'

        name = 'new_variable'

        result = subject.get_device(name)

        assert result is not None
        assert result == 'device: new_variable'

    def test_get_device_from_manager(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        self.device_manager.get_device = lambda name: f'device: {name}'

        name = 'found_device'

        result = subject.get_device(name)

        assert result is not None
        assert result == 'device: found_device'

        self.service_provider.device_variable.assert_not_called()

    def test_get_device_exists(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        def not_found(name: str):
            raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)
        self.device_manager.get_device = not_found

        self.service_provider.device_variable = lambda name: f'device: {name}'

        name = 'found_variable'

        # ensure it's already there
        subject.get_device(name)

        # then reset
        self.device_manager.get_device = mocker.Mock()
        self.service_provider.device_variable = mocker.Mock()

        result = subject.get_device(name)

        assert result is not None
        assert result == 'device: found_variable'

        self.device_manager.get_device.assert_not_called()
        self.service_provider.device_variable.assert_not_called()
