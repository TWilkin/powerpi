from pytest_mock import MockerFixture
from typing import Any, Dict

from powerpi_common.device import AdditionalStateDevice
from powerpi_common_test.device import AdditionalStateDeviceTestBase


class DeviceImpl(AdditionalStateDevice):
    def __init__(self, config, logger, mqtt_client):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, 
            name='test'
        )

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass

    def _on_additional_state_change(self, new_additional_state: Dict[str, Any]):
        return new_additional_state
    
    def _additional_state_keys(self):
        return ['a', 'b', 'c']


class TestAdditionalStateDevice(AdditionalStateDeviceTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(self.config, self.logger, self.mqtt_client)
