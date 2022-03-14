from unittest.mock import MagicMock, create_autospec

from pytest_mock import MockerFixture


def mock_producer(mocker: MockerFixture, mqtt_client: MagicMock):
    mocker.patch('powerpi_common_test.mqtt.mqtt.__mocked_mqtt_publish')
    mocker.patch.object(
        mqtt_client,
        'add_producer',
        return_value=__mocked_mqtt_publish
    )

    return __mocked_mqtt_publish


@create_autospec
def __mocked_mqtt_publish(topic: str, message: str):
    print(f'topic: {topic} message: {message}')
