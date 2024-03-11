from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.mqtt import MQTTClient
from pytest_mock import MockerFixture

from event.services.actions.action_device_additional_state import \
    action_device_additional_state


@pytest.mark.parametrize('scene', [None, 'default', 'other'])
def test_action_device_additional_state(
    powerpi_mqtt_client: MQTTClient,
    powerpi_mqtt_producer: MagicMock,
    powerpi_variable_manager,
    mocker: MockerFixture,
    scene: str | None
):
    device = mocker.MagicMock()
    type(device).name = PropertyMock(return_value='Light')
    type(device).additional_state = PropertyMock(return_value={
        'brightness': None,
        'other': 'untouched'
    })

    patch = [
        {
            'op': 'replace',
            'path': '/brightness',
            'value': 5000
        },
        {
            'op': 'add',
            'path': '/something',
            'value': 'boom'
        }
    ]

    subject = action_device_additional_state(
        powerpi_mqtt_client, powerpi_variable_manager, scene, patch
    )

    subject(device)

    expected_message = {
        'scene': scene,
        'brightness': 5000,
        'something': 'boom',
        'other': 'untouched'
    }

    if scene is None:
        del expected_message['scene']

    powerpi_mqtt_producer.assert_called_once_with(
        'device/Light/change',
        expected_message
    )


def test_action_device_additional_state_with_variable(
    powerpi_mqtt_client: MQTTClient,
    powerpi_mqtt_producer: MagicMock,
    powerpi_variable_manager,
    mocker: MockerFixture
):
    device = mocker.MagicMock()
    type(device).name = PropertyMock(return_value='Light')
    type(device).additional_state = PropertyMock(return_value={
        'brightness': None,
        'other': 'untouched'
    })

    powerpi_variable_manager.get_device = lambda _: device

    patch = [
        {
            'op': 'replace',
            'path': '/brightness',
            'value': {'var': 'device.Light.other'}
        }
    ]

    subject = action_device_additional_state(
        powerpi_mqtt_client, powerpi_variable_manager, None, patch
    )

    subject(device)

    expected_message = {
        'brightness': 'untouched',
        'other': 'untouched'
    }

    powerpi_mqtt_producer.assert_called_once_with(
        'device/Light/change',
        expected_message
    )
