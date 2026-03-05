from unittest.mock import MagicMock

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase
from zigpy.zcl import Cluster

from zigbee_controller.sensor.sonoff.switch import SonoffSwitchSensor


class TestSonoffSwitchSensor(SensorTestBase, InitialisableMixinTestBase):
    @pytest.mark.asyncio
    @pytest.mark.parametrize('command_id,expected_type', [
        (0x00, 'long'),
        (0x01, 'double'),
        (0x02, 'short'),
    ])
    async def test_button_press(
        self,
        subject: SonoffSwitchSensor,
        powerpi_mqtt_producer: MagicMock,
        zigbee_out_cluster: Cluster,
        command_id: int,
        expected_type: str
    ):
        await subject.initialise()

        # find the listener registered on the OnOff out_cluster
        listener = zigbee_out_cluster.add_listener.call_args[0][0]

        # simulate a cluster command
        listener.cluster_command(0, command_id, ())

        topic = 'event/test/press'

        message = {
            'button': 'button',
            'type': expected_type
        }

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return SonoffSwitchSensor(
            powerpi_logger, zigbee_controller, powerpi_mqtt_client,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA', name='test'
        )
