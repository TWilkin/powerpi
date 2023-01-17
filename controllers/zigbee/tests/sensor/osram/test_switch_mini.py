from asyncio import Future
from typing import List, Tuple
from unittest.mock import MagicMock

import pytest
from powerpi_common_test.device.base import BaseDeviceTestBaseNew
from powerpi_common_test.device.mixin import InitialisableMixinTestBaseNew
from zigbee_controller.sensor.osram.switch_mini import (Button,
                                                        OsramSwitchMiniSensor,
                                                        PressType)
from zigpy.zcl import Cluster


class TestOsramSwitchMiniSensor(BaseDeviceTestBaseNew, InitialisableMixinTestBaseNew):
    @pytest.mark.parametrize('button', [Button.UP, Button.MIDDLE, Button.DOWN])
    def test_single_press_handler(
        self,
        subject: OsramSwitchMiniSensor,
        powerpi_mqtt_producer: MagicMock,
        button: Button
    ):
        subject.button_press_handler(button, PressType.SINGLE)

        self.__verify_publish(powerpi_mqtt_producer, button, PressType.SINGLE)

    @pytest.mark.parametrize('button', [Button.UP, Button.DOWN])
    def test_long_button_press_handler_hold(
        self,
        subject: OsramSwitchMiniSensor,
        powerpi_mqtt_producer: MagicMock,
        button: Button
    ):
        subject.long_button_press_handler(button, [[0, 38]])

        self.__verify_publish(powerpi_mqtt_producer, button, PressType.HOLD)

    @pytest.mark.parametrize('button', [Button.UP, Button.DOWN])
    def test_long_button_press_handler_release(
        self,
        subject: OsramSwitchMiniSensor,
        powerpi_mqtt_producer: MagicMock,
        button: Button
    ):
        subject.long_button_press_handler(button, [[]])

        self.__verify_publish(powerpi_mqtt_producer, button, PressType.RELEASE)

    @pytest.mark.parametrize('args', [(PressType.HOLD, [254, 2]), (PressType.RELEASE, [0, 0])])
    def test_long_middle_button_press_handler(
        self,
        subject: OsramSwitchMiniSensor,
        powerpi_mqtt_producer: MagicMock,
        args: Tuple[PressType, List[int]]
    ):
        press_type, data = args

        subject.long_middle_button_press_handler([data])

        self.__verify_publish(powerpi_mqtt_producer, Button.MIDDLE, press_type)

    def test_long_middle_button_press_handler_skip(
        self,
        subject: OsramSwitchMiniSensor,
        powerpi_mqtt_producer: MagicMock,
    ):
        subject.long_middle_button_press_handler([[1, 1]])

        powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return OsramSwitchMiniSensor(
            powerpi_logger, zigbee_controller, powerpi_mqtt_client,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA', name='test'
        )

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_in_cluster: Cluster):
        zigbee_in_cluster.read_attributes.return_value = Future()

    def __verify_publish(
        self,
        powerpi_mqtt_producer: MagicMock,
        button: Button,
        press_type: PressType
    ):
        topic = 'event/test/press'

        message = {
            "button": button,
            "type": press_type
        }

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)
