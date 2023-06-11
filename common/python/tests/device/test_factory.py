import pytest

from powerpi_common.device import DeviceConfigType, DeviceFactory


class TestFactory:

    def test_build(self, subject: DeviceFactory, powerpi_service_provider):
        powerpi_service_provider.test_device = lambda **kwargs: kwargs

        result = subject.build(
            DeviceConfigType.DEVICE, 'test',
            a=1, b=2, c={'complex': 'thing'}
        )

        assert result == {'a': 1, 'b': 2, 'c': {'complex': 'thing'}}

    def test_build_no_factory(self, subject: DeviceFactory, powerpi_service_provider):
        powerpi_service_provider.test_device = None

        result = subject.build(DeviceConfigType.DEVICE, 'test')
        assert result is None

    @pytest.fixture
    def subject(self, powerpi_logger, powerpi_service_provider):
        return DeviceFactory(powerpi_logger, powerpi_service_provider)
