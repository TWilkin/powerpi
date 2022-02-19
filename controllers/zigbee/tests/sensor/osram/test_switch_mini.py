import pytest

from pytest_mock import MockerFixture
from typing import List, Tuple

from powerpi_common_test.mqtt import mock_producer
from powerpi_common_test.sensor import SensorTestBase
from zigbee_controller.sensor.osram.switch_mini \
    import Button, PressType, OsramSwitchMiniSensor


class TestOsramSwitchMiniSensor(SensorTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.controller = mocker.MagicMock()
        self.mqtt_client = mocker.Mock()

        self.endpoints = {
            1: mocker.Mock(),
            2: mocker.Mock(),
            3: mocker.Mock()
        }

        def getitem(key: str):
            return self.endpoints[key]

        self.controller.__getitem__.side_effect = getitem

        self.publish = mock_producer(mocker, self.mqtt_client)

        return OsramSwitchMiniSensor(
            self.logger, self.controller, self.mqtt_client,
            '00:00:00:00:00:00:00:00', '0xAAAA', 'test'
        )

    @pytest.mark.parametrize('button', [Button.UP, Button.MIDDLE, Button.DOWN])
    def test_single_press_handler(self, mocker: MockerFixture, button: Button):
        subject = self.get_subject(mocker)

        subject.button_press_handler(button, PressType.SINGLE)

        self.__verify_publish(button, PressType.SINGLE)
    
    @pytest.mark.parametrize('button', [Button.UP, Button.DOWN])
    def test_long_button_press_handler_hold(self, mocker: MockerFixture, button: Button):
        subject = self.get_subject(mocker)

        subject.long_button_press_handler(button, [[0, 38]])

        self.__verify_publish(button, PressType.HOLD)
    
    @pytest.mark.parametrize('button', [Button.UP, Button.DOWN])
    def test_long_button_press_handler_release(self, mocker: MockerFixture, button: Button):
        subject = self.get_subject(mocker)

        subject.long_button_press_handler(button, [[]])

        self.__verify_publish(button, PressType.RELEASE)
    
    @pytest.mark.parametrize('args', [(PressType.HOLD, [254, 2]), (PressType.RELEASE, [0, 0])])
    def test_long_middle_button_press_handler(self, mocker: MockerFixture, args: Tuple[PressType, List[int]]):
        subject = self.get_subject(mocker)

        subject.long_middle_button_press_handler([args[1]])

        self.__verify_publish(Button.MIDDLE, args[0])
    
    def test_long_middle_button_press_handler_skip(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.long_middle_button_press_handler([[1, 1]])

        self.publish.assert_not_called()
    
    def __verify_publish(self, button: Button, press_type: PressType):
        topic = f'event/test/press'
        
        message = {
            "button": button,
            "type": press_type
        }

        self.publish.assert_called_once_with(topic, message)
