from typing import Tuple, Union
from unittest.mock import MagicMock

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase
from powerpi_common_test.sensor.mixin import BatteryMixinTestBase

from zigbee_controller.sensor.aqara.door_window_sensor import \
    AqaraDoorWindowSensor


class TestAqaraDoorWindowSensor(SensorTestBase, InitialisableMixinTestBase, BatteryMixinTestBase):
    @pytest.mark.parametrize(
        'values', [(0, 'close'), (1, 'open'), (False, 'close'), (True, 'open')]
    )
    def test_open_close_handler(
        self,
        subject: AqaraDoorWindowSensor,
        powerpi_mqtt_producer: MagicMock,
        values: Tuple[Union[int, bool], str]
    ):
        (arg, state) = values

        subject.open_close_handler(arg)

        self.__verify_publish(powerpi_mqtt_producer, state)

    @pytest.mark.parametrize('arg', [2, -1, None])
    def test_open_close_handler_bad_args(
        self,
        subject: AqaraDoorWindowSensor,
        powerpi_mqtt_producer: MagicMock,
        arg: Union[int, None]
    ):
        subject.open_close_handler(arg)

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.parametrize('values', [
        (3100, 100),
        (3101, 100),
        (2820, 0),
        (2819, 0),
        (2819, 0),
        (3075, 91)
    ])
    def test_on_attribute_updated(
        self,
        subject: AqaraDoorWindowSensor,
        powerpi_mqtt_producer: MagicMock,
        values: Tuple[int, int]
    ):
        (data, percent) = values

        # data is attribute id (0x01), type value (0x21), data in little endian
        value = bytearray(b'\x01\x21')
        value += data.to_bytes(2, 'little')
        value = value.decode('utf8')

        subject.on_attribute_updated(0xFF01, value)

        topic = 'event/test/battery'
        message = {'value': percent, 'unit': '%'}
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.mark.parametrize('values', [(0xFF00, 0x01), (0xFF01, 0xBD)])
    def test_on_attribute_updated_other_data(
        self,
        subject: AqaraDoorWindowSensor,
        powerpi_mqtt_producer: MagicMock,
        values: Tuple[int, int]
    ):
        (attribute_id, data_id) = values

        # data is attribute id (0x02), type value (0x21), data in little endian
        value = bytearray(data_id)
        value += b'\x21\x00\x00'
        value = value.decode('utf8')

        subject.on_attribute_updated(attribute_id, value)

        powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return AqaraDoorWindowSensor(
            powerpi_logger, zigbee_controller, powerpi_mqtt_client,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='test'
        )

    def __verify_publish(self, powerpi_mqtt_producer: MagicMock, state: str):
        topic = 'event/test/change'

        message = {'state': state}

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)
