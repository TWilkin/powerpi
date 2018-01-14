import time

from unittest import TestCase, skip
from devices import HarmonyHub, HarmonyDevice


class TestHarmony(TestCase):

    __client = None

    @classmethod
    def setUpClass(cls):
        cls.__client = HarmonyHub('Tom\'s Hub')
        cls.__client.connect()

    @classmethod
    def tearDownClass(cls):
        cls.__client.disconnect()

    @skip(reason='Actually turns on/off the devices')
    def test_start_and_stop_activity(self):
        device = HarmonyDevice(self.__client, 'CD')
        device.turn_on()
        time.sleep(10)
        device.turn_off()
