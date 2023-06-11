from typing import Any, Dict

import pytest
from powerpi_common_test.device import AdditionalStateDeviceTestBaseNew

from powerpi_common.device import AdditionalStateDevice


# pylint: disable=too-many-ancestors
class DeviceImpl(AdditionalStateDevice):
    def __init__(self, config, logger, mqtt_client):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client,
            name='test'
        )

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    async def on_additional_state_change(self, new_additional_state: Dict[str, Any]):
        return new_additional_state

    def _additional_state_keys(self):
        return ['a', 'b', 'c']


class TestAdditionalStateDevice(AdditionalStateDeviceTestBaseNew):

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceImpl(powerpi_config, powerpi_logger, powerpi_mqtt_client)
