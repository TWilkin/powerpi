from typing import Tuple
from unittest.mock import MagicMock

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase

from zigbee_controller.sensor.sonoff.switch import SonoffSwitchSensor


class TestSonoffSwitchSensor(SensorTestBase, InitialisableMixinTestBase):
    @pytest.mark.parametrize('press_type', [(0, 'long'), (1, 'double'), (2, 'short')])
    def test_button_press_handler(
        self,
        subject: SonoffSwitchSensor,
        powerpi_mqtt_producer: MagicMock,
        press_type: Tuple[int, str]
    ):
        subject.button_press_handler(press_type[0])

        topic = 'event/test/press'

        message = {
            'button': 'button',
            'type': press_type[1]
        }

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return SonoffSwitchSensor(
            powerpi_logger, zigbee_controller, powerpi_mqtt_client,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA', name='test'
        )
