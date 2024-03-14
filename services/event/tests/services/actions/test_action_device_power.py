from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTClient
from pytest_mock import MockerFixture

from event.services.actions.action_device_power import action_device_power


@pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
def test_device_power_action(
    powerpi_mqtt_client: MQTTClient,
    powerpi_mqtt_producer: MagicMock,
    mocker: MockerFixture,
    state: DeviceStatus
):
    device = mocker.MagicMock()
    type(device).name = PropertyMock(return_value='Light')

    subject = action_device_power(powerpi_mqtt_client, state)

    subject(device)

    powerpi_mqtt_producer.assert_called_once_with(
        'device/Light/change', {'state': state}
    )
