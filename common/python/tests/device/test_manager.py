from pytest import raises
from pytest_mock import MockerFixture

from powerpi_common.device.manager import DeviceManager, DeviceType


class DummyDevice(object):
    def __init__(self, device_type: DeviceType, instance_type: str, name: str, **kwargs):
        self.device_type = device_type
        self.instance_type = instance_type
        self.name = name
        self.kwargs = kwargs


class TestDeviceManager(object):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.factory = mocker.Mock()

        def build(device_type: DeviceType, instance_type: str, **kwargs):
            return DummyDevice(device_type, instance_type, **kwargs)
        self.factory.build = build

        return DeviceManager(
            self.config, self.logger, self.factory
        )
    
    def test_load_no_content(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'devices', {
            'devices': [],
            'sensors': []
        })

        subject.load()
    
    def test_load_unknown(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        def build(_, __, **___):
            pass
        self.factory.build = build

        mocker.patch.object(self.config, 'devices', {
            'devices': [
                {'type': 'unknown'}
            ],
            'sensors': [
                {'type': 'unknown'}
            ]
        })

        subject.load()

        assert len(subject.devices) == 0
        assert len(subject.sensors) == 0
    
    def test_load_content(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'devices', {
            'devices': [
                {'type': 'test_device', 'name': 'a', 'something': 'else'},
                {'type': 'another_device', 'name': 'b'},
            ],
            'sensors': [
                {'type': 'test_sensor', 'name': 'c', 'yet_another_arg': 'more'},
                {'type': 'another_sensor', 'name': 'd'},
            ]
        })

        subject.load()

        for device_name, instance_type, additional in [('a', 'test_device', True), ('b', 'another_device', False)]:
            device = subject.get_device(device_name)
            assert device is not None
            assert device.device_type == DeviceType.DEVICE
            assert device.instance_type == instance_type
            assert device.name == device_name
            if additional:
                assert device.kwargs == { 'something': 'else' }
            else:
                assert device.kwargs == {}
        
        for sensor_name, instance_type, additional in [('c', 'test_sensor', True), ('d', 'another_sensor', False)]:
            sensor = subject.get_sensor(sensor_name)
            assert sensor is not None
            assert sensor.device_type == DeviceType.SENSOR
            assert sensor.instance_type == instance_type
            assert sensor.name == sensor_name
            if additional:
                assert sensor.kwargs == { 'yet_another_arg': 'more' }
            else:
                assert sensor.kwargs == {}
    
    def test_get_device_missing(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with raises(Exception):
            subject.get_device('unknown')
    
    def test_get_sensor_missing(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        with raises(Exception):
            subject.get_sensor('unknown')

