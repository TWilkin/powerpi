import pytest

from pytest import raises
from pytest_mock import MockerFixture

from powerpi_common.device import DeviceManager, DeviceNotFoundException, DeviceConfigType
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common_test.device.mixin import InitialisableMixinTestBase


class DummyDevice:
    def __init__(self, device_type: DeviceConfigType, instance_type: str, name: str, **kwargs):
        self.device_type = device_type
        self.instance_type = instance_type
        self.name = name
        self.kwargs = kwargs
        self.initialised = False

    def _initialise(self):
        # this is implemented here to prove it's not called for the wrong devices
        self.initialised = True


class InitialisationDummyDevice(DummyDevice, InitialisableMixin):
    pass


class TestDeviceManager(InitialisableMixinTestBase):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.factory = mocker.Mock()

        return DeviceManager(
            self.config, self.logger, self.factory
        )

    async def test_load_no_content(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'devices', {
            'devices': [],
            'sensors': []
        })

        await subject.load()

        assert len(subject.devices) == 0
        assert len(subject.sensors) == 0

    async def test_load_unknown(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

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

        await subject.load()

        assert len(subject.devices) == 0
        assert len(subject.sensors) == 0

    async def test_load_content(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        def build(device_type: DeviceConfigType, instance_type: str, **kwargs):
            if instance_type.startswith('another'):
                return InitialisationDummyDevice(device_type, instance_type, **kwargs)
            return DummyDevice(device_type, instance_type, **kwargs)
        self.factory.build = build

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

        await subject.load()

        for device_name, instance_type, additional, initialised in \
                [('a', 'test_device', True, False), ('b', 'another_device', False, True)]:
            device = subject.get_device(device_name)
            assert device is not None
            assert device.device_type == DeviceConfigType.DEVICE
            assert device.instance_type == instance_type
            assert device.name == device_name
            assert device.initialised == initialised

            if additional:
                assert device.kwargs == {'something': 'else'}
            else:
                assert device.kwargs == {}

        for sensor_name, instance_type, additional, initialised in \
                [('c', 'test_sensor', True, False), ('d', 'another_sensor', False, True)]:
            sensor = subject.get_sensor(sensor_name)
            assert sensor is not None
            assert sensor.device_type == DeviceConfigType.SENSOR
            assert sensor.instance_type == instance_type
            assert sensor.name == sensor_name
            assert sensor.initialised == initialised

            if additional:
                assert sensor.kwargs == {'yet_another_arg': 'more'}
            else:
                assert sensor.kwargs == {}

    def test_get_device_missing(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with raises(DeviceNotFoundException) as ex:
            subject.get_device('unknown')
        assert ex.match('Cannot find device "unknown"')

    def test_get_sensor_missing(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with raises(DeviceNotFoundException) as ex:
            subject.get_sensor('unknown')
        assert ex.match('Cannot find sensor "unknown"')
