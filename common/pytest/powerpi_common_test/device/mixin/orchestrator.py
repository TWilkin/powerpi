from abc import ABC

import pytest
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from pytest_mock import MockerFixture


class DeviceOrchestratorMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    def test_devices(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        devices = subject.devices
        assert devices is not None
        assert len(devices) > 0

    async def test_on_referenced_device_status_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.on_referenced_device_status('test_device', 'on')


class DeviceOrchestratorMixinTestBaseNew(ABC):
    def test_devices(self, subject: DeviceOrchestratorMixin):
        devices = subject.devices
        assert devices is not None
        assert len(devices) > 0

    @pytest.mark.asyncio
    async def test_on_referenced_device_status_implemented(self, subject: DeviceOrchestratorMixin):
        await subject.on_referenced_device_status('test_device', 'on')
