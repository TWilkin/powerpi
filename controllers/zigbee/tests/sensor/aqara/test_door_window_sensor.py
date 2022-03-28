from typing import Tuple, Union

import pytest

from pytest_mock import MockerFixture

from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.mqtt import mock_producer
from powerpi_common_test.sensor import SensorTestBase
from powerpi_common_test.sensor.mixin import BatteryMixinTestBase
from zigbee_controller.sensor.aqara.door_window_sensor import AqaraDoorWindowSensor


class TestAqaraDoorWindowSensor(
    SensorTestBase, BatteryMixinTestBase, InitialisableMixinTestBase
):
    def get_subject(self, mocker: MockerFixture):
        self.controller = mocker.MagicMock()

        self.endpoints = {
            1: mocker.Mock()
        }

        def getitem(key: str):
            return self.endpoints[key]

        self.controller.__getitem__.side_effect = getitem

        return AqaraDoorWindowSensor(
            self.logger, self.controller, self.mqtt_client,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='test'
        )

    @pytest.mark.parametrize('values', [(0, 'close'), (1, 'open'), (False, 'close'), (True, 'open')])
    def test_open_close_handler(self, mocker: MockerFixture, values: Tuple[Union[int, bool], str]):
        (arg, state) = values

        def mock():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, mock)

        subject.open_close_handler(arg)

        self.__verify_publish(state)

    @pytest.mark.parametrize('arg', [2, -1, None])
    def test_open_close_handler_bad_args(self, mocker: MockerFixture, arg: Union[int, None]):
        def mock():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, mock)

        subject.open_close_handler(arg)

        self.publish.assert_not_called()

    def __verify_publish(self, state: str):
        topic = 'event/test/change'

        message = {'state': state}

        self.publish.assert_called_once_with(topic, message)
