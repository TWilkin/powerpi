from unittest import TestCase
from powerpi.devices import DeviceManager


class TestDeviceManager(TestCase):

    def test_harmony(self):
        config = [
            {'type': 'harmony_hub', 'name': 'Tom\'s Hub'},
            {'type': 'harmony_activity', 'name': 'CD', 'hub': 'Tom\'s Hub'}
        ]
        DeviceManager.load(config)
        self.__check_device(config[0])
        self.__check_device(config[1])

    def __check_device(self, config):
        # find device by name and type
        device = DeviceManager.get_device(config['name'], device_type=config['type'])
        self.assertNotEqual(device, None)
