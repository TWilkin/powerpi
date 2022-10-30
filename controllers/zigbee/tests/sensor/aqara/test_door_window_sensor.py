from typing import Tuple, Union
from unittest.mock import patch

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.mqtt import mock_producer
from powerpi_common_test.sensor import SensorTestBase
from powerpi_common_test.sensor.mixin import BatteryMixinTestBase
from pytest_mock import MockerFixture
from zigbee_controller.sensor.aqara.door_window_sensor import \
    AqaraDoorWindowSensor


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

    @pytest.mark.parametrize('values', [
        (3100, 100),
        (3101, 100),
        (2820, 0),
        (2819, 0),
        (2819, 0),
        (3075, 91)
    ])
    def test_on_attribute_updated(self, mocker: MockerFixture, values: Tuple[int, int]):
        (data, percent) = values

        def mock():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, mock)

        # data is attribute id (0x01), type value (0x21), data in little endian
        value = bytearray(b'\x01\x21')
        value += data.to_bytes(2, 'little')
        value = value.decode('utf8')

        subject.on_attribute_updated(0xFF01, value)

        topic = 'event/test/battery'
        message = {'value': percent, 'unit': '%'}
        self.publish.assert_called_once_with(topic, message)

    @pytest.mark.parametrize('values', [(0xFF00, 0x01), (0xFF01, 0xBD)])
    def test_on_attribute_updated_other_data(self, mocker: MockerFixture, values: Tuple[int, int]):
        (attribute_id, data_id) = values

        def mock():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, mock)

        # data is attribute id (0x02), type value (0x21), data in little endian
        value = bytearray(data_id)
        value += b'\x21\x00\x00'
        value = value.decode('utf8')

        subject.on_attribute_updated(attribute_id, value)

        self.publish.assert_not_called()

    def __verify_publish(self, state: str):
        topic = 'event/test/change'

        message = {'state': state}

        self.publish.assert_called_once_with(topic, message)
