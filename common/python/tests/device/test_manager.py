import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from pytest import raises
from pytest_mock import MockerFixture

from powerpi_common.device import (DeviceConfigType, DeviceManager,
                                   DeviceNotFoundException)
from powerpi_common.device.mixin import InitialisableMixin


class DummyDevice:
    def __init__(self, device_type: DeviceConfigType, instance_type: str, name: str, **kwargs):
        self.device_type = device_type
        self.instance_type = instance_type
        self.name = name
        self.kwargs = kwargs
        self.initialised = False
        self.deinitialised = False

    async def initialise(self):
        # this is implemented here to prove it's not called for the wrong devices
        self.initialised = True

    async def deinitialise(self):
        # this is implemented here to prove it's not called for the wrong devices
        self.deinitialised = True


class InitialisationDummyDevice(DummyDevice, InitialisableMixin):
    pass


class TestDeviceManager(InitialisableMixinTestBase):

    @pytest.mark.asyncio
    async def test_load_no_content(
        self,
        subject: DeviceManager,
        powerpi_config,
        mocker: MockerFixture
    ):
        mocker.patch.object(powerpi_config, 'devices', {
            'devices': [],
            'sensors': []
        })

        await subject.load()

        assert len(subject.devices) == 0
        assert len(subject.sensors) == 0
        assert len(subject.devices_and_sensors) == 0

    @pytest.mark.asyncio
    async def test_load_unknown(
        self,
        subject: DeviceManager,
        powerpi_config,
        device_factory,
        mocker: MockerFixture
    ):
        def build(_, __, **___):
            pass
        device_factory.build = build

        mocker.patch.object(powerpi_config, 'devices', {
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
        assert len(subject.devices_and_sensors) == 0

    @pytest.mark.asyncio
    async def test_load_content(
        self,
        subject: DeviceManager,
        powerpi_config,
        device_factory,
        mocker: MockerFixture
    ):
        def build(device_type: DeviceConfigType, instance_type: str, **kwargs):
            if instance_type.startswith('another'):
                return InitialisationDummyDevice(device_type, instance_type, **kwargs)
            return DummyDevice(device_type, instance_type, **kwargs)
        device_factory.build = build

        mocker.patch.object(powerpi_config, 'devices', {
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

        assert len(subject.devices) == 2
        assert len(subject.sensors) == 2
        assert len(subject.devices_and_sensors) == 4

        for device_name, instance_type, additional, initialised in \
                [('a', 'test_device', True, False), ('b', 'another_device', False, True)]:
            device = subject.get_device(device_name)
            assert device is not None
            assert device.device_type == DeviceConfigType.DEVICE
            assert device.instance_type == instance_type
            assert device.name == device_name
            assert device.initialised == initialised
            assert device.deinitialised is False

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
            assert device.deinitialised is False

            if additional:
                assert sensor.kwargs == {'yet_another_arg': 'more'}
            else:
                assert sensor.kwargs == {}

    @pytest.mark.asyncio
    async def test_deinitialise(
        self,
        subject: DeviceManager,
        powerpi_config,
        device_factory,
        mocker: MockerFixture
    ):
        def build(device_type: DeviceConfigType, instance_type: str, **kwargs):
            if instance_type.startswith('another'):
                return InitialisationDummyDevice(device_type, instance_type, **kwargs)
            return DummyDevice(device_type, instance_type, **kwargs)
        device_factory.build = build

        mocker.patch.object(powerpi_config, 'devices', {
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

        assert all(
            device.deinitialised is False for device in subject.devices.values()
        )
        assert all(
            sensor.deinitialised is False for sensor in subject.sensors.values()
        )

        await subject.deinitialise()

        assert subject.get_device('a').deinitialised is False
        assert subject.get_device('b').deinitialised is True

        assert subject.get_sensor('c').deinitialised is False
        assert subject.get_sensor('d').deinitialised is True

    def test_get_device_missing(self, subject: DeviceManager):
        with raises(DeviceNotFoundException) as ex:
            subject.get_device('unknown')

        assert ex.match('Cannot find device "unknown"')

    def test_get_sensor_missing(self, subject: DeviceManager):
        with raises(DeviceNotFoundException) as ex:
            subject.get_sensor('unknown')

        assert ex.match('Cannot find sensor "unknown"')

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, device_factory):
        return DeviceManager(
            powerpi_config, powerpi_logger, device_factory
        )

    @pytest.fixture
    def device_factory(self, mocker: MockerFixture):
        return mocker.MagicMock()
