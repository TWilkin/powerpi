from typing import Any, Dict

import pytest
from powerpi_common_test.device import AdditionalStateDeviceTestBase

from powerpi_common.device import AdditionalStateDevice, ReservedScenes


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


class TestAdditionalStateDevice(AdditionalStateDeviceTestBase):

    @pytest.mark.asyncio
    async def test_change_power_and_additional_state_merges(
        self,
        subject: AdditionalStateDevice
    ):
        assert subject.additional_state == {}

        await subject.change_power_and_additional_state(
            ReservedScenes.DEFAULT,
            new_additional_state={'a': 1, 'c': 3, 'd': 4}
        )

        assert subject.additional_state == {'a': 1, 'c': 3}

        # now set the state of another scene
        await subject.change_power_and_additional_state(
            'other',
            new_additional_state={'b': 2, 'c': 4, 'd': 5}
        )

        assert subject.additional_state == {'a': 1, 'c': 3}

        # switching scene will apply the merged state,
        # but keeping a as the scene had not value for it
        await subject.change_scene('other')

        assert subject.additional_state == {'a': 1, 'b': 2, 'c': 4}

        # switching back will restore, but keep b as the scene had no value for it
        await subject.change_scene(ReservedScenes.DEFAULT)

        assert subject.additional_state == {'a': 1, 'b': 2, 'c': 3}

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceImpl(powerpi_config, powerpi_logger, powerpi_mqtt_client)
