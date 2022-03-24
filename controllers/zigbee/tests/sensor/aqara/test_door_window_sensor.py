from typing import Tuple, Union

import pytest

from pytest_mock import MockerFixture

from powerpi_common_test.mqtt.mqtt import mock_producer
from powerpi_common_test.sensor.sensor import SensorTestBase
from zigbee_controller.sensor.aqara.door_window_sensor import AqaraDoorWindowSensor


class TestAqaraDoorWindowSensor(SensorTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.controller = mocker.MagicMock()

        self.endpoints = {
            1: mocker.Mock()
        }

        def getitem(key: str):
            return self.endpoints[key]

        self.controller.__getitem__.side_effect = getitem

        self.publish = mock_producer(mocker, self.mqtt_client)

        return AqaraDoorWindowSensor(
            self.logger, self.controller, self.mqtt_client,
            '00:00:00:00:00:00:00:00', '0xAAAA', name='test'
        )

    @pytest.mark.parametrize('values', [(0, 'close'), (1, 'open'), (False, 'close'), (True, 'open')])
    def test_open_close_handler(self, mocker: MockerFixture, values: Tuple[Union[int, bool], str]):
        (arg, state) = values

        subject = self.create_subject(mocker)

        subject.open_close_handler(arg)

        self.__verify_publish(state)

    @pytest.mark.parametrize('arg', [2, -1, None])
    def test_open_close_handler_bad_args(self, mocker: MockerFixture, arg: Union[int, None]):
        subject = self.create_subject(mocker)

        subject.open_close_handler(arg)

        self.publish.assert_not_called()

    def __verify_publish(self, state: str):
        topic = 'event/test/change'

        message = {'state': state}

        self.publish.assert_called_once_with(topic, message)
