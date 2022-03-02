from abc import ABC
from pytest_mock import MockerFixture


class DeviceOrchestratorMixinTestBase(ABC):    
    def test_devices(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        devices = subject.devices
        assert devices is not None
        assert len(devices) > 0
    
    def test_on_referenced_device_status_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        subject.on_referenced_device_status('test_device', 'on')
