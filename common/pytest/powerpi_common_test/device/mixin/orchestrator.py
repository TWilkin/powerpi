from abc import ABC

from powerpi_common.device.mixin import DeviceOrchestratorMixin

import pytest


class DeviceOrchestratorMixinTestBase(ABC):
    def test_devices(self, subject: DeviceOrchestratorMixin):
        devices = subject.devices
        assert devices is not None
        assert len(devices) > 0

    @pytest.mark.asyncio
    async def test_on_referenced_device_status_implemented(self, subject: DeviceOrchestratorMixin):
        await subject.on_referenced_device_status('test_device', 'on')
