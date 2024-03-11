from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.mqtt import MQTTClient
from pytest_mock import MockerFixture

from event.services.actions.action_device_scene import action_device_scene


@pytest.mark.parametrize('scene', [None, 'default', 'other'])
def test_action_device_scene(
    powerpi_mqtt_client: MQTTClient,
    powerpi_mqtt_producer: MagicMock,
    mocker: MockerFixture,
    scene: str | None
):
    device = mocker.MagicMock()
    type(device).name = PropertyMock(return_value='Light')

    subject = action_device_scene(powerpi_mqtt_client, scene)

    subject(device)

    powerpi_mqtt_producer.assert_called_once_with(
        'device/Light/scene', {'scene': scene}
    )
